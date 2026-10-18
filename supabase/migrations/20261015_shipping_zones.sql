-- Shipping zones for Cairo, Giza and Alexandria.
create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  governorate text not null,
  area text not null,
  shipping_fee numeric(10,2) not null,
  is_active boolean not null default true,
  unique (governorate, area),
  constraint shipping_zones_fee_positive check (shipping_fee >= 0)
);

create index if not exists shipping_zones_lookup_idx
  on public.shipping_zones(governorate, is_active, area);

alter table public.shipping_zones enable row level security;
drop policy if exists "shipping_zones_public_select" on public.shipping_zones;
create policy "shipping_zones_public_select"
  on public.shipping_zones for select to anon, authenticated
  using (is_active = true);

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
('الإسكندرية','العصافرة',110),('الإسكندرية','المندرة',110),('الإسكندرية','سيدي بشر',110),
('الإسكندرية','العجمي',130),('الإسكندرية','العامرية',130),('الإسكندرية','برج العرب',140),
('الإسكندرية','المنتزه',110),('الإسكندرية','محرم بك',100)
on conflict (governorate, area) do update set shipping_fee = excluded.shipping_fee, is_active = true;
