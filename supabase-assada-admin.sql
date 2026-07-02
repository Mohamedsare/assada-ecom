-- ============================================================================
-- Assada — Livreurs, rôle Employé, permissions & canal de commande
-- Migration ADDITIVE : ne modifie aucune table/policy existante, ajoute
-- uniquement de nouvelles colonnes, tables, fonctions et policies.
-- À exécuter après supabase-schema.sql.
-- ============================================================================

-- ---- Fonction : staff (admin, super_admin ou employé) ----------------------
create or replace function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin', 'employee')
  );
$$ language sql security definer stable;

-- ---- PROFILES : rôle « employee » + matrice de permissions -----------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'employee', 'admin', 'super_admin', 'delivery_agent'));

alter table public.profiles
  add column if not exists permissions jsonb not null default '{}'::jsonb;

-- ---- TABLE : livreurs (créée AVANT la FK depuis orders) --------------------
create table if not exists public.delivery_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  zones text,                         -- zones couvertes (séparées par des virgules)
  is_active boolean not null default true,
  note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ---- ORDERS : canal de vente + livreur assigné -----------------------------
alter table public.orders
  add column if not exists channel text not null default 'site'
  check (channel in ('site', 'whatsapp', 'store'));

alter table public.orders
  add column if not exists delivery_agent_id uuid
  references public.delivery_agents(id) on delete set null;

alter table public.delivery_agents enable row level security;

-- ---- POLICIES ADDITIVES (staff) --------------------------------------------
-- Les policies existantes (is_admin) restent en place ; PostgreSQL combine les
-- policies permissives par OR, donc celles-ci élargissent l'accès au staff.

drop policy if exists "Staff gère livreurs" on public.delivery_agents;
create policy "Staff gère livreurs" on public.delivery_agents
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff lit commandes" on public.orders;
create policy "Staff lit commandes" on public.orders
  for select using (public.is_staff());

drop policy if exists "Staff met à jour commandes" on public.orders;
create policy "Staff met à jour commandes" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff gère produits" on public.products;
create policy "Staff gère produits" on public.products
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff gère catégories" on public.categories;
create policy "Staff gère catégories" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Staff gère marques" on public.brands;
create policy "Staff gère marques" on public.brands
  for all using (public.is_staff()) with check (public.is_staff());

-- ---- Index utiles ----------------------------------------------------------
create index if not exists idx_orders_delivery_agent on public.orders(delivery_agent_id);
create index if not exists idx_orders_channel on public.orders(channel);
