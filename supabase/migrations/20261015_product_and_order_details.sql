-- Extra catalog and order details.
-- Idempotent: safe to run in the Supabase SQL Editor on an existing database.

alter table public.products
  add column if not exists compare_at_price numeric(10,2),
  add column if not exists discount_label text not null default '',
  add column if not exists story text not null default '',
  add column if not exists fit_notes text not null default '',
  add column if not exists gender text not null default 'unisex',
  add column if not exists weight_grams integer,
  add column if not exists size_guide text not null default '',
  add column if not exists styling_notes text not null default '',
  add column if not exists season text not null default '';

alter table public.products
  drop constraint if exists products_price_positive,
  drop constraint if exists products_compare_price_valid,
  drop constraint if exists products_weight_positive,
  drop constraint if exists products_gender_valid;

alter table public.products
  add constraint products_price_positive check (price >= 0),
  add constraint products_compare_price_valid check (
    compare_at_price is null or (compare_at_price >= 0 and compare_at_price >= price)
  ),
  add constraint products_weight_positive check (weight_grams is null or weight_grams > 0),
  add constraint products_gender_valid check (gender in ('mens','womens','unisex','kids'));

alter table public.orders
  add column if not exists secondary_phone text,
  add column if not exists city_area text,
  add column if not exists building_apartment text,
  add column if not exists landmark text,
  add column if not exists subtotal_amount numeric(10,2),
  add column if not exists discount_amount numeric(10,2) not null default 0,
  add column if not exists shipping_fee numeric(10,2) not null default 0,
  add column if not exists coupon_code text,
  add column if not exists payment_method text not null default 'cash_on_delivery',
  add column if not exists whatsapp_confirmed boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders
  drop constraint if exists orders_status_check,
  drop constraint if exists orders_amounts_non_negative,
  drop constraint if exists orders_payment_method_valid;

alter table public.orders
  add constraint orders_status_check check (
    status in ('pending','confirmed','processing','out_for_delivery','delivered','cancelled')
  ),
  add constraint orders_amounts_non_negative check (
    total_amount >= 0
    and discount_amount >= 0
    and shipping_fee >= 0
    and (subtotal_amount is null or subtotal_amount >= 0)
  ),
  add constraint orders_payment_method_valid check (
    payment_method in ('cash_on_delivery','card','bank_transfer')
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.order_items

  add column if not exists color text not null default '',
  add column if not exists unit_price numeric(10,2),
  add column if not exists total_price numeric(10,2);

alter table public.order_items
  drop constraint if exists order_items_price_non_negative,
  drop constraint if exists order_items_quantity_positive;

alter table public.order_items
  add constraint order_items_price_non_negative check (
    price >= 0 and (unit_price is null or unit_price >= 0)
  ),
  add constraint order_items_quantity_positive check (quantity > 0);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_status_created_at_idx on public.orders(status, created_at desc);
create index if not exists products_active_index_idx on public.products(is_active, index);
