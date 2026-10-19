-- Add design file (print PNG) to products table
-- Idempotent: safe to run multiple times

alter table public.products
  add column if not exists print_file_url text not null default '';
