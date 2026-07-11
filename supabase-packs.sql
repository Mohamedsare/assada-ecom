-- =============================================
-- RYTA — Coffrets cadeaux (packs)
-- Un pack = un produit (products.is_pack = true) composé de plusieurs
-- produits vendus ensemble. Le prix du pack est celui de la ligne produit.
-- À exécuter dans l'éditeur SQL Supabase.
-- =============================================

-- 1) Drapeau « pack » sur les produits
alter table public.products
  add column if not exists is_pack boolean not null default false;

create index if not exists idx_products_is_pack on public.products(is_pack);

-- 2) Composition d'un pack : les produits qu'il contient
create table if not exists public.pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.products(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_pack_items_pack on public.pack_items(pack_id);
create index if not exists idx_pack_items_product on public.pack_items(product_id);

-- 3) RLS : lecture publique, écriture réservée à l'admin (comme product_images)
alter table public.pack_items enable row level security;

drop policy if exists "Lecture publique pack_items" on public.pack_items;
create policy "Lecture publique pack_items" on public.pack_items
  for select using (true);

drop policy if exists "Admin gère pack_items" on public.pack_items;
create policy "Admin gère pack_items" on public.pack_items
  for all using (public.is_admin());
