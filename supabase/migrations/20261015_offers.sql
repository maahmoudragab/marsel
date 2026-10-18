-- Timed offers. Shipping offers are mutually exclusive at checkout:
-- the highest-priority eligible offer wins.
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  offer_type text not null,
  governorate text,
  minimum_quantity integer,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  priority integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint offers_type_valid check (offer_type in ('free_shipping_governorate','free_shipping_quantity')),
  constraint offers_dates_valid check (ends_at > starts_at),
  constraint offers_governorate_valid check (
    offer_type <> 'free_shipping_governorate'
    or governorate in ('القاهرة','الجيزة','الإسكندرية')
  ),
  constraint offers_quantity_valid check (
    offer_type <> 'free_shipping_quantity' or minimum_quantity >= 2
  )
);

create index if not exists offers_active_window_idx
  on public.offers(is_active, starts_at, ends_at, priority desc);

alter table public.offers enable row level security;
drop policy if exists "offers_public_select" on public.offers;
create policy "offers_public_select"
  on public.offers for select to anon, authenticated
  using (is_active = true and now() between starts_at and ends_at);
drop policy if exists "offers_dashboard_mutations" on public.offers;
create policy "offers_dashboard_mutations"
  on public.offers for all to anon, authenticated
  using (true) with check (true);
