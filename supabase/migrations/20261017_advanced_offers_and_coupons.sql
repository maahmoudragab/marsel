-- Migration: Advanced Offers and Coupons Capabilities
-- 1. Add starts_at to coupons
alter table public.coupons 
  add column if not exists starts_at timestamptz default now();

-- 2. Drop the restrictive check constraints on offers if they exist
alter table public.offers 
  drop constraint if exists offers_type_valid,
  drop constraint if exists offers_governorate_valid,
  drop constraint if exists offers_quantity_valid;

-- 3. Add rich offer columns for flexible promotions
alter table public.offers 
  add column if not exists discount_value numeric(10,2) default null,
  add column if not exists discount_type text default 'fixed',
  add column if not exists minimum_order_amount numeric(10,2) default null,
  add column if not exists free_quantity integer default null,
  add column if not exists show_banner boolean not null default true,
  add column if not exists banner_text text default null;
