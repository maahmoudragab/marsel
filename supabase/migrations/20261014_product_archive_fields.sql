-- Product archive fields: gallery, material, fit, care, colour
-- Idempotent. Run in the Supabase SQL editor if CLI is not linked.

alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists color_name text not null default '';
alter table public.products add column if not exists color_hex text not null default '#111111';
alter table public.products add column if not exists composition text not null default '';
alter table public.products add column if not exists structure text not null default '';
alter table public.products add column if not exists fit text not null default '';
alter table public.products add column if not exists category text not null default 'hoodie';
alter table public.products add column if not exists care text not null default '';
alter table public.products add column if not exists collection text not null default 'DROP 01';
alter table public.products add column if not exists provenance text not null default 'EGYPT';
alter table public.products add column if not exists house_label text not null default 'MARSEL';
alter table public.products add column if not exists tags text[] not null default '{}';

update public.products
set images = array[image]
where coalesce(cardinality(images), 0) = 0
  and image is not null
  and image <> '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_images_max'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_images_max check (cardinality(images) <= 5);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_select" on storage.objects;
create policy "product_images_public_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_public_insert" on storage.objects;
create policy "product_images_public_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_public_update" on storage.objects;
create policy "product_images_public_update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_public_delete" on storage.objects;
create policy "product_images_public_delete"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'product-images');
