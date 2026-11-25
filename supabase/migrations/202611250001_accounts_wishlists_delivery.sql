-- Optional customer accounts, synced wishlists, delivery fee, idempotent checkout,
-- automatic restocking of cancelled orders, and a stricter admin check.
-- Safe to run more than once.

-- 1. Admin check: match the signed-in auth user AND require a confirmed email.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from auth.users u
    join public.admins a on a.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 2. Orders: optional owner, delivery fee, and a checkout token so a retry never duplicates an order.
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0);
alter table public.orders add column if not exists checkout_token uuid unique;
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

drop policy if exists "Customers read their own orders" on public.orders;
create policy "Customers read their own orders" on public.orders for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "Customers read their own order items" on public.order_items;
create policy "Customers read their own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));

-- 3. Delivery charges, editable in Admin -> Site Settings. 0 means free delivery.
alter table public.site_settings add column if not exists delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0);
alter table public.site_settings add column if not exists free_delivery_over numeric(12,2) check (free_delivery_over is null or free_delivery_over >= 0);

-- 4. Wishlists for signed-in customers (guests keep theirs in the browser).
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.wishlists enable row level security;
drop policy if exists "Customers manage their own wishlist" on public.wishlists;
create policy "Customers manage their own wishlist" on public.wishlists for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.wishlists from anon;
grant select, insert, update, delete on public.wishlists to authenticated, service_role;

-- 5. Order creation: same authoritative price/stock checks, plus owner, delivery fee and idempotency.
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
  v_fee numeric(12,2) := 0;
  v_free_over numeric(12,2);
  v_token uuid := nullif(p_customer->>'checkout_token','')::uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 30 then
    raise exception 'Invalid order items' using errcode = '22023';
  end if;
  if length(coalesce(p_customer->>'name','')) not between 2 and 120
    or length(coalesce(p_customer->>'phone','')) not between 7 and 60
    or length(coalesce(p_customer->>'email','')) not between 5 and 254
    or length(coalesce(p_customer->>'address','')) not between 5 and 500
    or length(coalesce(p_customer->>'city','')) not between 2 and 120
    or length(coalesce(p_customer->>'notes','')) > 1000 then
    raise exception 'Invalid customer details' using errcode = '22023';
  end if;

  if v_token is not null then
    -- Serialises simultaneous retries of one checkout; the second call returns the first order.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_token::text, 0));
    select * into v_order from public.orders where checkout_token = v_token;
    if found then
      return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'total',v_order.total,'duplicate',true);
    end if;
  end if;

  insert into public.orders(customer_name,phone,email,address,city,notes,user_id,checkout_token)
  values (btrim(p_customer->>'name'), btrim(p_customer->>'phone'), lower(btrim(p_customer->>'email')), btrim(p_customer->>'address'), btrim(p_customer->>'city'), coalesce(btrim(p_customer->>'notes'),''), nullif(p_customer->>'user_id','')::uuid, v_token)
  returning * into v_order;

  -- Lock rows in a fixed order so two overlapping carts cannot deadlock.
  for v_item in select value from jsonb_array_elements(p_items) order by value->>'productId', value->>'variantId' loop
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
    elsif exists(select 1 from public.product_variants where product_id=v_product_id) then
      raise exception 'Choose a size for every item' using errcode = '22023';
    end if;

    insert into public.order_items(order_id,product_id,variant_id,title,size,quantity,unit_price,line_total)
    values (v_order.id,v_product_id,v_variant_id,v_title,v_size,v_quantity,v_price,v_price*v_quantity);
    v_subtotal := v_subtotal + v_price*v_quantity;
  end loop;

  -- Mark products sold out only after every line is taken (two sizes of one product may be in one cart).
  update public.products p set is_sold_out = true
   where p.id in (select oi.product_id from public.order_items oi where oi.order_id = v_order.id and oi.variant_id is not null)
     and not exists (select 1 from public.product_variants pv where pv.product_id = p.id and pv.stock > 0);

  select coalesce(s.delivery_fee,0), s.free_delivery_over into v_fee, v_free_over
    from public.site_settings s where s.setting_key = 'storefront';
  v_fee := coalesce(v_fee, 0);
  if v_free_over is not null and v_subtotal >= v_free_over then v_fee := 0; end if;

  update public.orders set subtotal=v_subtotal, delivery_fee=v_fee, total=v_subtotal+v_fee where id=v_order.id returning * into v_order;
  return jsonb_build_object('id',v_order.id,'order_number',v_order.order_number,'total',v_order.total);
end;
$$;
revoke all on function public.create_cod_order(jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.create_cod_order(jsonb,jsonb) to service_role;

-- 6. Cancelling an order returns its stock; un-cancelling takes it again.
create or replace function public.sync_stock_with_order_status()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_item record;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    for v_item in select product_id, variant_id, quantity from public.order_items where order_id = new.id and variant_id is not null order by variant_id loop
      -- Only reopen products that ran out; a product hidden by hand while in stock stays as it is.
      update public.products p set is_sold_out = false where p.id = v_item.product_id
        and not exists (select 1 from public.product_variants pv where pv.product_id = p.id and pv.stock > 0);
      update public.product_variants set stock = stock + v_item.quantity where id = v_item.variant_id;
    end loop;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    for v_item in select product_id, variant_id, quantity from public.order_items where order_id = new.id and variant_id is not null order by variant_id loop
      update public.product_variants set stock = stock - v_item.quantity where id = v_item.variant_id and stock >= v_item.quantity;
      if not found then raise exception 'Insufficient stock to reopen this order' using errcode = 'P0001'; end if;
      update public.products p set is_sold_out = true where p.id = v_item.product_id
        and not exists (select 1 from public.product_variants pv where pv.product_id = p.id and pv.stock > 0);
    end loop;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_stock_with_order_status() from public, anon, authenticated;
drop trigger if exists orders_sync_stock on public.orders;
create trigger orders_sync_stock after update of status on public.orders for each row execute function public.sync_stock_with_order_status();
