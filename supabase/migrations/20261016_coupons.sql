-- Create coupons table
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

-- Index for fast lookup
create index if not exists coupons_code_idx on public.coupons(code, is_active);

-- Enable RLS
alter table public.coupons enable row level security;

-- Policies
create policy "coupons_public_select"
  on public.coupons for select to anon, authenticated
  using (is_active = true);

create policy "coupons_admin_all"
  on public.coupons for all to anon, authenticated
  using (true) with check (true);

-- Seed sample coupons
insert into public.coupons (code, discount_type, discount_value, minimum_order_amount, is_active)
values 
  ('MARSEL10', 'percentage', 10.00, 0, true),
  ('DROP01', 'fixed', 100.00, 800.00, true)
on conflict (code) do nothing;