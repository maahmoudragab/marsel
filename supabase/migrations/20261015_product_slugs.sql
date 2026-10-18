alter table public.products add column if not exists slug text;

create unique index if not exists products_slug_unique_idx
  on public.products(slug)
  where slug is not null;

update public.products
set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
  || '-' || right(replace(id::text, '-', ''), 5)
where slug is null;
