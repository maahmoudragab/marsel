-- Update images max constraint to allow 6 product photos
alter table public.products drop constraint if exists products_images_max;

alter table public.products
  add constraint products_images_max check (cardinality(images) <= 6);
