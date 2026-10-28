create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (length(email) <= 254 and position('@' in email) > 1),
  status text not null default 'active' check (status in ('active','unsubscribed')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  email text not null check (length(email) <= 254 and position('@' in email) > 1),
  phone text not null default '' check (length(phone) <= 60),
  message text not null check (length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
alter table public.messages enable row level security;
drop policy if exists "Public may subscribe" on public.subscribers;
create policy "Public may subscribe" on public.subscribers for insert to anon, authenticated with check (status = 'active');
drop policy if exists "Admins manage subscribers" on public.subscribers;
create policy "Admins manage subscribers" on public.subscribers for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Public may send contact messages" on public.messages;
create policy "Public may send contact messages" on public.messages for insert to anon, authenticated with check (status = 'new');
drop policy if exists "Admins manage contact messages" on public.messages;
create policy "Admins manage contact messages" on public.messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert on public.subscribers, public.messages to anon, authenticated;
grant select, insert, update, delete on public.subscribers, public.messages to authenticated;

-- The server validates the customer payload and sends product/variant IDs only.
-- This security-definer function does the authoritative price lookup and stock
-- decrement together with order insertion in one Postgres transaction.
create or replace function public.create_cod_order(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;
  v_title text;
  v_price numeric(12,2);
  v_size text;
  v_stock integer;
  v_subtotal numeric(12,2) := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'Invalid order items' using errcode = '22023';
  end if;
  if length(coalesce(p_customer->>'name','')) not between 2 and 120
    or length(coalesce(p_customer->>'phone','')) not between 7 and 60
    or length(coalesce(p_customer->>'email','')) > 254
    or length(coalesce(p_customer->>'address','')) not between 5 and 500
    or length(coalesce(p_customer->>'city','')) not between 2 and 120
    or length(coalesce(p_customer->>'notes','')) > 1000 then
    raise exception 'Invalid customer details' using errcode = '22023';
  end if;

  insert into public.orders(customer_name,phone,email,address,city,notes)
  values (btrim(p_customer->>'name'), btrim(p_customer->>'phone'), nullif(lower(btrim(p_customer->>'email')),''), btrim(p_customer->>'address'), btrim(p_customer->>'city'), coalesce(btrim(p_customer->>'notes'),''))
  returning * into v_order;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_product_id := (v_item->>'productId')::uuid;
    v_variant_id := nullif(v_item->>'variantId','')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 20 then raise exception 'Invalid quantity' using errcode = '22023'; end if;

    select p.title,p.price into v_title,v_price
      from public.products p where p.id=v_product_id and p.status='published' and not p.is_sold_out for update;
    if not found then raise exception 'Product unavailable' using errcode = 'P0001'; end if;

    v_size := null;
    if v_variant_id is not null then
      select pv.stock,pv.size into v_stock,v_size from public.product_variants pv
        where pv.id=v_variant_id and pv.product_id=v_product_id for update;
      if not found or v_stock < v_quantity then raise exception 'Insufficient stock' using errcode = 'P0001'; end if;
      update public.product_variants set stock=stock-v_quantity where id=v_variant_id;
      update public.products set is_sold_out=not exists(select 1 from public.product_variants where product_id=v_product_id and stock>0) where id=v_product_id;
    elsif exists(select 1 from public.product_variants where product_id=v_product_id) then
      raise exception 'Choose a size for every item' using errcode = '22023';
    end if;

    insert into public.order_items(order_id,product_id,variant_id,title,size,quantity,unit_price,line_total)
    values (v_order.id,v_product_id,v_variant_id,v_title,v_size,v_quantity,v_price,v_price*v_quantity);
    v_subtotal := v_subtotal + v_price*v_quantity;
  end loop;

  update public.orders set subtotal=v_subtotal,total=v_subtotal where id=v_order.id returning * into v_order;
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'total',v_order.total);
end;
$$;

revoke all on function public.create_cod_order(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.create_cod_order(jsonb,jsonb) to service_role;

