-- MARSEL database schema
-- Fresh install: this file intentionally removes the application tables.
-- Run once in Supabase SQL Editor, then run the product seed file if needed.

create extension if not exists "pgcrypto";

drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.offers cascade;
drop table if exists public.shipping_zones cascade;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

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

create table public.products (
  id                uuid primary key default gen_random_uuid(),
  index             integer not null unique,
  title             text not null,
  slug              text unique,
  price             numeric(10,2) not null default 0,
  compare_at_price  numeric(10,2),
  discount_label    text not null default '',
  image             text not null default '/hoodie-cropped.png',
  images            text[] not null default '{}',
  sizes             text[] not null default '{S,M,L,XL,XXL}',
  description       text not null default '',
  story             text not null default '',
  details           text[] not null default '{}',
  color_name        text not null default '',
  color_hex         text not null default '#111111',
  composition       text not null default '',
  structure         text not null default '',
  fit               text not null default '',
  fit_notes         text not null default '',
  gender            text not null default 'unisex',
  weight_grams      integer,
  size_guide        text not null default '',
  styling_notes     text not null default '',
  season            text not null default '',
  category          text not null default 'hoodie',
  care              text not null default '',
  collection        text not null default 'DROP 01',
  provenance        text not null default 'EGYPT',
  house_label       text not null default 'MARSEL',
  tags              text[] not null default '{}',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  constraint products_price_positive check (price >= 0),
  constraint products_compare_price_valid check (
    compare_at_price is null or (compare_at_price >= 0 and compare_at_price >= price)
  ),
  constraint products_weight_positive check (weight_grams is null or weight_grams > 0),
  constraint products_gender_valid check (gender in ('mens','womens','unisex','kids')),
  constraint products_images_max check (cardinality(images) <= 5)
);

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text unique not null,
  customer_name       text not null,
  customer_age        integer,
  phone               text not null,
  secondary_phone     text,
  governorate         text not null,
  area                text not null,
  city_area           text,
  address             text not null,
  location_latitude  numeric(9,6),
  location_longitude numeric(9,6),
  location_url       text,
  building_apartment  text,
  landmark            text,
  notes               text,
  subtotal_amount     numeric(10,2) not null default 0,
  discount_amount     numeric(10,2) not null default 0,
  shipping_fee        numeric(10,2) not null default 0,
  total_amount        numeric(10,2) not null default 0,
  coupon_code         text,
  payment_method      text not null default 'cash_on_delivery',
  status              text not null default 'pending',
  whatsapp_confirmed  boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint orders_status_valid check (
    status in ('pending','confirmed','processing','out_for_delivery','delivered','cancelled')
  ),
  constraint orders_payment_valid check (
    payment_method in ('cash_on_delivery','card','bank_transfer')
  ),
  constraint orders_amounts_non_negative check (
    subtotal_amount >= 0 and discount_amount >= 0
    and shipping_fee >= 0 and total_amount >= 0
  ),
  constraint orders_location_pair_valid check (
    (location_latitude is null and location_longitude is null)
    or (location_latitude between -90 and 90 and location_longitude between -180 and 180)
  )
);

create table public.shipping_zones (
  id             uuid primary key default gen_random_uuid(),
  governorate    text not null,
  area           text not null,
  shipping_fee   numeric(10,2) not null,
  is_active      boolean not null default true,
  unique (governorate, area),
  constraint shipping_zones_fee_positive check (shipping_fee >= 0)
);

create table public.offers (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  description         text not null default '',
  offer_type          text not null,
  governorate         text,
  minimum_quantity    integer,
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,
  priority            integer not null default 0,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  constraint offers_type_valid check (
    offer_type in ('free_shipping_governorate','free_shipping_quantity')
  ),
  constraint offers_dates_valid check (ends_at > starts_at),
  constraint offers_governorate_valid check (
    offer_type <> 'free_shipping_governorate'
    or governorate in ('القاهرة','الجيزة','الإسكندرية')
  ),
  constraint offers_quantity_valid check (
    offer_type <> 'free_shipping_quantity'
    or minimum_quantity >= 2
  )
);

create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  title        text not null,
  size         text not null,
  color        text not null default '',
  price        numeric(10,2) not null,
  unit_price   numeric(10,2) not null,
  quantity     integer not null default 1,
  total_price  numeric(10,2) not null,
  image        text not null default '/hoodie-cropped.png',
  created_at   timestamptz not null default now(),
  constraint order_items_price_valid check (price >= 0 and unit_price >= 0 and total_price >= 0),
  constraint order_items_quantity_positive check (quantity > 0)
);

create or replace function public.set_order_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_order_updated_at();

create index products_active_index_idx on public.products(is_active, index);
create index orders_status_created_at_idx on public.orders(status, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);
create index shipping_zones_lookup_idx on public.shipping_zones(governorate, is_active, area);
create index offers_active_window_idx on public.offers(is_active, starts_at, ends_at, priority desc);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.offers enable row level security;

create policy "products_public_select"
  on public.products for select to anon, authenticated
  using (is_active = true);

create policy "products_admin_mutations"
  on public.products for all to anon, authenticated
  using (true) with check (true);


create policy "orders_public_insert"
  on public.orders for insert to anon, authenticated
  with check (true);

create policy "orders_dashboard_select"
  on public.orders for select to anon, authenticated
  using (true);

create policy "orders_dashboard_update"
  on public.orders for update to anon, authenticated
  using (true) with check (true);

create policy "order_items_public_insert"
  on public.order_items for insert to anon, authenticated
  with check (true);

create policy "order_items_dashboard_select"
  on public.order_items for select to anon, authenticated
  using (true);

create policy "shipping_zones_public_select"
  on public.shipping_zones for select to anon, authenticated
  using (is_active = true);

create policy "offers_public_select"
  on public.offers for select to anon, authenticated
  using (is_active = true and now() between starts_at and ends_at);

create policy "offers_dashboard_mutations"
  on public.offers for all to anon, authenticated
  using (true) with check (true);

insert into public.shipping_zones (governorate, area, shipping_fee) values
('القاهرة','عين شمس',60),('القاهرة','مصر الجديدة',60),('القاهرة','مدينة نصر',60),
('القاهرة','المعادي',60),('القاهرة','المقطم',60),('القاهرة','حلوان',60),
('القاهرة','شبرا',60),('القاهرة','الزمالك',60),('القاهرة','وسط البلد',60),
('القاهرة','المرج',60),('القاهرة','السلام',60),('القاهرة','مدينة بدر',70),
('الجيزة','الدقي',70),('الجيزة','المهندسين',70),('الجيزة','العجوزة',70),
('الجيزة','الهرم',70),('الجيزة','فيصل',70),('الجيزة','6 أكتوبر',80),
('الجيزة','الشيخ زايد',80),('الجيزة','حدائق أكتوبر',80),('الجيزة','إمبابة',70),
('الجيزة','الوراق',70),('الجيزة','العياط',90),('الجيزة','البدرشين',90),
('الإسكندرية','سموحة',100),('الإسكندرية','سيدي جابر',100),('الإسكندرية','رشدي',100),
('الإسكندرية','محطة الرمل',100),('الإسكندرية','كامب شيزار',100),('الإسكندرية','ميامي',110),
('الإسكندرية','ال عصافرة',110),('الإسكندرية','المندرة',110),('الإسكندرية','سيدي بشر',110),
('الإسكندرية','العجمي',130),('الإسكندرية','العامرية',130),('الإسكندرية','برج العرب',140),
('الإسكندرية','المنتزه',110),('الإسكندرية','محرم بك',100)
on conflict (governorate, area) do update set shipping_fee = excluded.shipping_fee, is_active = true;

-- ============================================================
-- COUPONS TABLE
-- ============================================================
create table if not exists public.coupons (
  id                   uuid primary key default gen_random_uuid(),
  code                 text unique not null,
  discount_type        text not null check (discount_type in ('percentage', 'fixed')),
  discount_value       numeric(10,2) not null check (discount_value > 0),
  minimum_order_amount numeric(10,2) default 0,
  max_uses             integer,
  used_count           integer not null default 0,
  is_active            boolean not null default true,
  expires_at           timestamptz,
  created_at           timestamptz not null default now()
);

create index if not exists coupons_code_idx on public.coupons(code, is_active);
alter table public.coupons enable row level security;

create policy "coupons_public_select"
  on public.coupons for select to anon, authenticated
  using (is_active = true);

create policy "coupons_admin_all"
  on public.coupons for all to anon, authenticated
  using (true) with check (true);

insert into public.coupons (code, discount_type, discount_value, minimum_order_amount, is_active)
values 
  ('MARSEL10', 'percentage', 10.00, 0, true),
  ('DROP01', 'fixed', 100.00, 800.00, true)
on conflict (code) do nothing;