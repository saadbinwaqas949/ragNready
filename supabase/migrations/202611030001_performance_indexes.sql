-- Index public catalog lookups, relationship joins, and recent order sorting.
create index if not exists products_handle_idx
  on public.products (handle);

create index if not exists products_status_idx
  on public.products (status);

create index if not exists products_sort_order_idx
  on public.products (sort_order);

create index if not exists product_images_product_id_position_idx
  on public.product_images (product_id, position);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);

create index if not exists product_collections_product_id_idx
  on public.product_collections (product_id);

create index if not exists product_collections_collection_id_idx
  on public.product_collections (collection_id);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);
