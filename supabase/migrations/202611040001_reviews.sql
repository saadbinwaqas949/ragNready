create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (length(btrim(comment)) between 1 and 3000),
  reviewer_name text not null check (length(btrim(reviewer_name)) between 1 and 120),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table if not exists public.review_images (
  review_id uuid not null references public.reviews(id) on delete cascade,
  url text not null,
  position smallint not null check (position between 0 and 2),
  primary key (review_id, position)
);

alter table public.reviews enable row level security;
alter table public.review_images enable row level security;

drop policy if exists "Approved reviews are public" on public.reviews;
create policy "Approved reviews are public" on public.reviews for select to anon, authenticated using (status = 'approved' or public.is_admin());
drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Approved review photos are public" on public.review_images;
create policy "Approved review photos are public" on public.review_images for select to anon, authenticated using (exists (select 1 from public.reviews r where r.id = review_id and r.status = 'approved') or public.is_admin());
drop policy if exists "Admins manage review photos" on public.review_images;
create policy "Admins manage review photos" on public.review_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.reviews, public.review_images to anon, authenticated;
grant select, insert, update, delete on public.reviews, public.review_images to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Review photos are publicly readable" on storage.objects;
create policy "Review photos are publicly readable" on storage.objects for select to anon, authenticated using (bucket_id = 'review-images');
drop policy if exists "Admins upload review photos" on storage.objects;
create policy "Admins upload review photos" on storage.objects for insert to authenticated with check (bucket_id = 'review-images' and public.is_admin());
drop policy if exists "Admins delete review photos" on storage.objects;
create policy "Admins delete review photos" on storage.objects for delete to authenticated using (bucket_id = 'review-images' and public.is_admin());
