-- Store the customer's map pin for delivery confirmation.
alter table public.orders
  add column if not exists location_latitude numeric(9,6),
  add column if not exists location_longitude numeric(9,6),
  add column if not exists location_url text;

alter table public.orders
  drop constraint if exists orders_location_pair_valid;

alter table public.orders
  add constraint orders_location_pair_valid check (
    (location_latitude is null and location_longitude is null)
    or (location_latitude between -90 and 90 and location_longitude between -180 and 180)
  );
