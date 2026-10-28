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

-- Starter collections and sample catalog. Replace sample descriptions/photos in Admin.
insert into public.collections(title,handle,description,image,sort_order) values
('Baby Body Suits','body-suits','Soft everyday bodysuits for little beginnings.','/images/placeholders/product-sky.svg',1),
('Little Occasion Wear','frocks','Thoughtful outfits for tiny celebrations.','/images/placeholders/product-blush.svg',2),
('Everyday Rompers','rompers','Easy, comfortable rompers for everyday moments.','/images/placeholders/product-sand.svg',3),
('Caps & Accessories','caps-accessories','Small finishing touches for little ones.','/images/placeholders/product-sunshine.svg',4),
('Bundles & Sets','bundles-sets','Coordinated essentials, thoughtfully gathered.','/images/placeholders/product-lavender.svg',5),
('Gift Sets','gift-set','Meaningful gifts for new arrivals.','/images/placeholders/product-seafoam.svg',6),
('Starter Sets','starter-set','A considered start to their first wardrobe.','/images/placeholders/product-cream.svg',7),
('New Arrivals','new-arrivals','Newly chosen pieces for little moments.','/images/placeholders/product-blush.svg',8)
on conflict(handle) do update set title=excluded.title, description=excluded.description, image=excluded.image, sort_order=excluded.sort_order;

insert into public.products(title,handle,description,price,compare_at_price,gender,season,status,is_sold_out,badges,sort_order,fabric_care) values
('Soft Lavender Newborn Baby Essentials Set','soft-lavender-newborn-baby-essentials-set','A gentle lavender welcome-home bundle with coordinated newborn essentials.','1999.50','3999.00','Unisex','All Seasons','published',true,array['Sale'],1,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Newborn Essentials Set – Seafoam Green','newborn-essentials-set-seafoam-green','A fresh seafoam set of newborn essentials, thoughtfully grouped for gifting.','1999.50','3999.00','Unisex','All Seasons','published',false,array['Sale'],2,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Newborn Essentials Set – Sand Beige','newborn-essentials-set-sand-beige','A calm sand-toned newborn set for everyday comfort and gifting.','1999.50','3999.00','Unisex','All Seasons','published',true,array['Sale'],3,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Baby Winter Set – Silver Stitch','baby-winter-set-silver-stitch','A cozy silver-stitch set for cooler days and snug little outings.','2199.00',null,'Unisex','Winter','published',false,'{}',4,'Warm knit blend. Gentle cold wash; dry flat.'),
('Baby Winter Set – Navy Splash','baby-winter-set-navy-splash','A cozy navy winter set with thoughtful details for little explorers.','2199.00',null,'Boys','Winter','published',false,'{}',5,'Warm knit blend. Gentle cold wash; dry flat.'),
('Midnight Knit Baby Winter Set – Black & White','midnight-knit-baby-winter-set-black-white','A monochrome knit set made for crisp mornings and cozy afternoons.','2199.00',null,'Unisex','Winter','published',false,'{}',6,'Warm knit blend. Gentle cold wash; dry flat.'),
('Baby Winter Set – Blush Stripe','baby-winter-set-blush-stripe','A soft blush-striped winter set for tiny seasonal adventures.','2199.00',null,'Girls','Winter','published',false,'{}',7,'Warm knit blend. Gentle cold wash; dry flat.'),
('Hooded Baby Winter Romper – Cloud Frog','hooded-baby-winter-romper-cloud-frog','A snug hooded romper with a playful cloud-frog theme.','2999.00',null,'Unisex','Winter','published',false,'{}',8,'Soft cotton fleece. Wash inside out on a gentle cold cycle.'),
('Sky Breeze Baby Bodysuit','sky-breeze-baby-bodysuit','A breathable sky-blue bodysuit for easy everyday changes.','1499.00',null,'Unisex','Summer','published',false,'{}',9,'Breathable cotton jersey. Machine wash cold; tumble dry low.'),
('Sunshine Twirl Baby Frock','sunshine-twirl-baby-frock','A cheerful sunshine-yellow frock for bright little occasions.','1899.00',null,'Girls','Summer','published',false,'{}',10,'Light cotton voile. Gentle machine wash; line dry.'),
('Sand Dune Baby Romper','sand-dune-baby-romper','A sand-beige romper with a soft feel for all-day wear.','1799.00',null,'Unisex','All Seasons','published',false,'{}',11,'Soft cotton blend. Machine wash cold with like colours.'),
('Little Sunshine Baby Cap','little-sunshine-baby-cap','A sunny soft cap to finish a little outfit.','699.00',null,'Unisex','Summer','published',false,'{}',12,'Cotton jersey. Hand wash gently; reshape while damp.'),
('10pc Gift Set','10pc-gift-set','Ten coordinated newborn essentials, ready to make a thoughtful first gift.','4999.00',null,'Unisex','All Seasons','published',false,array['Gift'],13,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Cloud Cotton Baby Bodysuit','cloud-cotton-baby-bodysuit','A cloud-soft ivory bodysuit with easy-change snaps.','1399.00',null,'Unisex','All Seasons','published',false,'{}',14,'100% cotton jersey. Machine wash cold; tumble dry low.'),
('Petal Dots Baby Bodysuit','petal-dots-baby-bodysuit','A sweet blush dot-print bodysuit for everyday cuddles.','1499.00',null,'Girls','Summer','published',false,'{}',15,'Breathable cotton jersey. Machine wash cold; tumble dry low.'),
('Moonbeam Wrap Baby Bodysuit','moonbeam-wrap-baby-bodysuit','A gentle wrap-front bodysuit made for easy newborn dressing.','1599.00',null,'Unisex','All Seasons','published',false,'{}',16,'Soft cotton rib. Wash cold on a gentle cycle; line dry.'),
('Little Daisy Baby Frock','little-daisy-baby-frock','A light floral frock for family visits and sunny celebrations.','1999.00',null,'Girls','Summer','published',false,'{}',17,'Light cotton voile. Gentle machine wash; line dry.'),
('Sunday Best Baby Frock','sunday-best-baby-frock','A timeless occasion frock with a soft lining and easy fit.','2299.00',null,'Girls','All Seasons','published',false,'{}',18,'Cotton outer with soft lining. Gentle cold wash; line dry.'),
('Sage Garden Baby Romper','sage-garden-baby-romper','A calm sage romper with room to wriggle and explore.','1799.00',null,'Unisex','Summer','published',false,'{}',19,'Breathable cotton jersey. Machine wash cold; line dry.'),
('Cloud Nine Everyday Romper','cloud-nine-everyday-romper','An everyday cloud-print romper, soft and simple to wear.','1699.00',null,'Unisex','All Seasons','published',false,'{}',20,'Soft cotton blend. Machine wash cold with like colours.'),
('Cozy Bear Baby Cap','cozy-bear-baby-cap','A warm little cap with a gentle bear-inspired detail.','799.00',null,'Unisex','Winter','published',false,'{}',21,'Cotton knit. Hand wash cold; dry flat.'),
('Little Bloom Knotted Cap','little-bloom-knotted-cap','A soft knotted cap in a delicate little bloom print.','699.00',null,'Girls','Summer','published',false,'{}',22,'Cotton jersey. Hand wash gently; reshape while damp.'),
('Meadow Muslin Starter Set','meadow-muslin-starter-set','A breathable starter bundle in soft meadow-inspired tones.','3499.00',null,'Unisex','Summer','published',false,array['New'],23,'Double-layer cotton muslin. Gentle cold wash; line dry.'),
('First Hello Hospital Set','first-hello-hospital-set','A considered set of first-day essentials for meeting your little one.','3899.00',null,'Unisex','All Seasons','published',false,array['Gift'],24,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Tiny Star Socks & Mittens Set','tiny-star-socks-mittens-set','Coordinated socks and mittens to keep tiny hands and toes cozy.','999.00',null,'Unisex','All Seasons','published',false,'{}',25,'Soft cotton knit. Wash in a mesh bag on a gentle cold cycle.')
on conflict(handle) do update set title=excluded.title,description=excluded.description,price=excluded.price,compare_at_price=excluded.compare_at_price,gender=excluded.gender,season=excluded.season,status=excluded.status,is_sold_out=excluded.is_sold_out,badges=excluded.badges,sort_order=excluded.sort_order,fabric_care=excluded.fabric_care;

insert into public.product_images(product_id,url,alt,position)
select p.id, img.url, p.title || ' – placeholder image ' || img.position, img.position
from public.products p
cross join (values
  ('/images/placeholders/product-cream.svg',0),
  ('/images/placeholders/product-seafoam.svg',1),
  ('/images/placeholders/product-sand.svg',2)
) as img(url,position)
where p.handle in (
  'soft-lavender-newborn-baby-essentials-set','newborn-essentials-set-seafoam-green','newborn-essentials-set-sand-beige','baby-winter-set-silver-stitch','baby-winter-set-navy-splash','midnight-knit-baby-winter-set-black-white','baby-winter-set-blush-stripe','hooded-baby-winter-romper-cloud-frog','sky-breeze-baby-bodysuit','sunshine-twirl-baby-frock','sand-dune-baby-romper','little-sunshine-baby-cap','10pc-gift-set','cloud-cotton-baby-bodysuit','petal-dots-baby-bodysuit','moonbeam-wrap-baby-bodysuit','little-daisy-baby-frock','sunday-best-baby-frock','sage-garden-baby-romper','cloud-nine-everyday-romper','cozy-bear-baby-cap','little-bloom-knotted-cap','meadow-muslin-starter-set','first-hello-hospital-set','tiny-star-socks-mittens-set'
)
on conflict(product_id,position) do update set url=excluded.url, alt=excluded.alt;

with seed_sizes(handle,sizes) as (values
('baby-winter-set-navy-splash',array['6-9 Months','9-12 Months']),
('hooded-baby-winter-romper-cloud-frog',array['9-12 Months','12-18 Months']),
('soft-lavender-newborn-baby-essentials-set',array['0-3 Months','3-6 Months']),
('newborn-essentials-set-sand-beige',array['0-3 Months','3-6 Months']),
('default',array['0-3 Months','3-6 Months','6-9 Months','9-12 Months','12-18 Months'])
), product_sizes as (
  select p.id,p.handle,sz.size,p.is_sold_out
  from public.products p
  cross join lateral unnest(coalesce((select ss.sizes from seed_sizes ss where ss.handle=p.handle), (select ss.sizes from seed_sizes ss where ss.handle='default'))) as sz(size)
  where p.handle in (
    'soft-lavender-newborn-baby-essentials-set','newborn-essentials-set-seafoam-green','newborn-essentials-set-sand-beige','baby-winter-set-silver-stitch','baby-winter-set-navy-splash','midnight-knit-baby-winter-set-black-white','baby-winter-set-blush-stripe','hooded-baby-winter-romper-cloud-frog','sky-breeze-baby-bodysuit','sunshine-twirl-baby-frock','sand-dune-baby-romper','little-sunshine-baby-cap','10pc-gift-set','cloud-cotton-baby-bodysuit','petal-dots-baby-bodysuit','moonbeam-wrap-baby-bodysuit','little-daisy-baby-frock','sunday-best-baby-frock','sage-garden-baby-romper','cloud-nine-everyday-romper','cozy-bear-baby-cap','little-bloom-knotted-cap','meadow-muslin-starter-set','first-hello-hospital-set','tiny-star-socks-mittens-set'
  )
)
insert into public.product_variants(product_id,size,stock,sku)
select ps.id,ps.size,case when ps.is_sold_out then 0 else 8 end,upper(ps.handle) || '-' || upper(replace(replace(ps.size,' Months',''),' ',''))
from product_sizes ps
on conflict(product_id,size) do update set stock=excluded.stock,sku=excluded.sku;

with assignments(handle,collections) as (values
('soft-lavender-newborn-baby-essentials-set',array['bundles-sets','starter-set','new-arrivals']),
('newborn-essentials-set-seafoam-green',array['bundles-sets','gift-set','new-arrivals']),
('newborn-essentials-set-sand-beige',array['bundles-sets','starter-set']),
('baby-winter-set-silver-stitch',array['bundles-sets','new-arrivals']),
('baby-winter-set-navy-splash',array['bundles-sets']),
('midnight-knit-baby-winter-set-black-white',array['bundles-sets']),
('baby-winter-set-blush-stripe',array['bundles-sets']),
('hooded-baby-winter-romper-cloud-frog',array['rompers','new-arrivals']),
('sky-breeze-baby-bodysuit',array['body-suits','new-arrivals']),
('sunshine-twirl-baby-frock',array['frocks']),
('sand-dune-baby-romper',array['rompers']),
('little-sunshine-baby-cap',array['caps-accessories']),
('10pc-gift-set',array['gift-set','bundles-sets']),
('cloud-cotton-baby-bodysuit',array['body-suits']),
('petal-dots-baby-bodysuit',array['body-suits','new-arrivals']),
('moonbeam-wrap-baby-bodysuit',array['body-suits','starter-set']),
('little-daisy-baby-frock',array['frocks','new-arrivals']),
('sunday-best-baby-frock',array['frocks']),
('sage-garden-baby-romper',array['rompers']),
('cloud-nine-everyday-romper',array['rompers','new-arrivals']),
('cozy-bear-baby-cap',array['caps-accessories']),
('little-bloom-knotted-cap',array['caps-accessories','new-arrivals']),
('meadow-muslin-starter-set',array['starter-set','bundles-sets']),
('first-hello-hospital-set',array['gift-set','starter-set']),
('tiny-star-socks-mittens-set',array['caps-accessories','gift-set'])
)
insert into public.product_collections(product_id,collection_id)
select p.id,c.id from assignments a
join public.products p on p.handle=a.handle
cross join lateral unnest(a.collections) as h(handle)
join public.collections c on c.handle=h.handle
on conflict do nothing;

insert into public.site_settings(setting_key,store_name,tagline,phone,whatsapp_number,email,address,social_links,legal_owner_line,is_published)
values ('storefront','ragNready','Soft beginnings, thoughtfully chosen.','+92 300 0000000','+92 300 0000000','hello@example.com','Lahore, Pakistan','{}',null,true)
on conflict(setting_key) do update set store_name=excluded.store_name,tagline=excluded.tagline,phone=excluded.phone,whatsapp_number=excluded.whatsapp_number,email=excluded.email,address=excluded.address,social_links=excluded.social_links,legal_owner_line=excluded.legal_owner_line,is_published=true;

-- Initial admin email is read from .env.local. This is an email address, not a key.

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

