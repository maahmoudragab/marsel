-- ==============================================================================
-- Security Hardening Migration: Revoke Unauthorized Public (anon) Write/Read Access
-- ==============================================================================

-- 1. PRODUCTS: Revoke public mutations (anon can ONLY read active products)
drop policy if exists "products_admin_mutations" on public.products;
drop policy if exists "products_public_select" on public.products;

create policy "products_public_select"
  on public.products for select to anon, authenticated
  using (is_active = true);

create policy "products_service_role_all"
  on public.products for all to service_role
  using (true) with check (true);

-- 2. ORDERS: Revoke public select and update (prevent mass customer PII leaks)
drop policy if exists "orders_dashboard_select" on public.orders;
drop policy if exists "orders_dashboard_update" on public.orders;
drop policy if exists "orders_public_insert" on public.orders;

-- Orders can now be created and managed securely via server endpoints (service_role)
create policy "orders_service_role_all"
  on public.orders for all to service_role
  using (true) with check (true);

-- 3. ORDER ITEMS: Revoke public select
drop policy if exists "order_items_dashboard_select" on public.order_items;
drop policy if exists "order_items_public_insert" on public.order_items;

create policy "order_items_service_role_all"
  on public.order_items for all to service_role
  using (true) with check (true);

-- 4. COUPONS: Revoke public mutation/tampering
drop policy if exists "coupons_admin_all" on public.coupons;
drop policy if exists "coupons_public_select" on public.coupons;

create policy "coupons_public_select"
  on public.coupons for select to anon, authenticated
  using (is_active = true);

create policy "coupons_service_role_all"
  on public.coupons for all to service_role
  using (true) with check (true);

-- 5. OFFERS: Revoke public mutations
drop policy if exists "offers_dashboard_mutations" on public.offers;
drop policy if exists "offers_public_select" on public.offers;

create policy "offers_public_select"
  on public.offers for select to anon, authenticated
  using (is_active = true and now() between starts_at and ends_at);

create policy "offers_service_role_all"
  on public.offers for all to service_role
  using (true) with check (true);

-- 6. STORAGE: Restrict image upload/deletion to service_role / authenticated only
drop policy if exists "product_images_public_insert" on storage.objects;
drop policy if exists "product_images_public_update" on storage.objects;
drop policy if exists "product_images_public_delete" on storage.objects;

create policy "product_images_authenticated_insert"
  on storage.objects for insert to authenticated, service_role
  with check (bucket_id = 'product-images');

create policy "product_images_authenticated_update"
  on storage.objects for update to authenticated, service_role
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "product_images_authenticated_delete"
  on storage.objects for delete to authenticated, service_role
  using (bucket_id = 'product-images');
