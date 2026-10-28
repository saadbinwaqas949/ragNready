-- ragNready catalog, orders, settings, admin access, and product image storage.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  handle text not null unique,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  gender text not null default 'Unisex' check (gender in ('Boys','Girls','Unisex')),
  season text not null default 'All Seasons' check (season in ('Winter','Summer','All Seasons')),
  status text not null default 'draft' check (status in ('draft','published')),
  is_sold_out boolean not null default false,
  badges text[] not null default '{}',
  sort_order integer not null default 0,
  fabric_care text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, position)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  sku text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  handle text not null unique,
  description text not null default '',
  image text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, collection_id)
);

create sequence if not exists public.order_number_seq;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('RR-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  notes text not null default '',
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  title text not null,
  size text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique default 'storefront' check (setting_key = 'storefront'),
  store_name text not null default 'ragNready',
  tagline text not null default 'Soft beginnings, thoughtfully chosen.',
  phone text not null default '+92 300 0000000',
  whatsapp_number text not null default '+92 300 0000000',
  email text not null default 'hello@example.com',
  address text not null default 'Lahore, Pakistan',
  social_links jsonb not null default '{}'::jsonb,
  legal_owner_line text,
  announcement_messages text[] not null default array['Soft beginnings, thoughtfully chosen.','A thoughtfully designed ragNready card is included with selected gift orders.','New starter set now available.'],
  hero_headline text not null default 'soft beginnings, thoughtfully chosen',
  hero_subtext text not null default 'Discover thoughtfully selected baby clothing, everyday essentials and meaningful gift sets created for life''s littlest moments.',
  hero_cta_text text not null default 'Shop new arrivals',
  popup_discount_code text not null default 'CODE20OFF',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and auth.uid() is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

do $$ declare t text; begin
  foreach t in array array['products','product_images','product_variants','collections','product_collections','orders','order_items','site_settings','admins'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

drop policy if exists "Published products are readable" on public.products;
create policy "Published products are readable" on public.products for select to anon, authenticated using (status = 'published' or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published product images are readable" on public.product_images;
create policy "Published product images are readable" on public.product_images for select to anon, authenticated using (exists(select 1 from public.products p where p.id = product_id and p.status = 'published') or public.is_admin());
drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published variants are readable" on public.product_variants;
create policy "Published variants are readable" on public.product_variants for select to anon, authenticated using (exists(select 1 from public.products p where p.id = product_id and p.status = 'published') or public.is_admin());
drop policy if exists "Admins manage variants" on public.product_variants;
create policy "Admins manage variants" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Collections are publicly readable" on public.collections;
create policy "Collections are publicly readable" on public.collections for select to anon, authenticated using (true);
drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections" on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published product collection links are readable" on public.product_collections;
create policy "Published product collection links are readable" on public.product_collections for select to anon, authenticated using (exists(select 1 from public.products p where p.id = product_id and p.status = 'published') or public.is_admin());
drop policy if exists "Admins manage product collection links" on public.product_collections;
create policy "Admins manage product collection links" on public.product_collections for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published settings are readable" on public.site_settings;
create policy "Published settings are readable" on public.site_settings for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage admin records" on public.admins;
create policy "Admins manage admin records" on public.admins for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.products, public.product_images, public.product_variants, public.collections, public.product_collections, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.products, public.product_images, public.product_variants, public.collections, public.product_collections, public.orders, public.order_items, public.site_settings, public.admins to authenticated;
grant usage, select on sequence public.order_number_seq to authenticated, service_role;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists variants_set_updated_at on public.product_variants;
create trigger variants_set_updated_at before update on public.product_variants for each row execute function public.set_updated_at();
drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at before update on public.collections for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists settings_set_updated_at on public.site_settings;
create trigger settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
