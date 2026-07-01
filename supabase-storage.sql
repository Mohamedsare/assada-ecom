-- =============================================================
-- STORAGE — Buckets & policies pour Odm's Shopping
-- À exécuter dans Supabase → SQL Editor (une seule fois).
-- Corrige l'erreur "Bucket not found" lors de l'upload d'images.
-- =============================================================

-- 1) Création des buckets publics (idempotent)
--    Le bucket `products` accepte images ET vidéos.
--    file_size_limit = 52428800 octets (50 Mo) pour permettre les vidéos produit.
--    NB : cette limite ne peut PAS dépasser la limite globale du projet
--    (Dashboard → Storage → Settings). Pour des vidéos > 50 Mo, augmente-la là-bas.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('products',   'products',   true, 52428800),
  ('categories', 'categories', true,  5242880),
  ('brands',     'brands',     true,  5242880),
  ('avatars',    'avatars',    true,  5242880)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit;

-- 2) Policies sur storage.objects
--    (on supprime d'abord pour rendre le script ré-exécutable)

-- Lecture publique des images de ces buckets
drop policy if exists "Lecture publique storage" on storage.objects;
create policy "Lecture publique storage" on storage.objects
  for select
  using (bucket_id in ('products', 'categories', 'brands', 'avatars'));

-- Upload réservé aux admins (produits / catégories / marques)
drop policy if exists "Admin upload storage" on storage.objects;
create policy "Admin upload storage" on storage.objects
  for insert
  with check (
    bucket_id in ('products', 'categories', 'brands')
    and public.is_admin()
  );

-- Mise à jour réservée aux admins
drop policy if exists "Admin update storage" on storage.objects;
create policy "Admin update storage" on storage.objects
  for update
  using (
    bucket_id in ('products', 'categories', 'brands')
    and public.is_admin()
  );

-- Suppression réservée aux admins
drop policy if exists "Admin delete storage" on storage.objects;
create policy "Admin delete storage" on storage.objects
  for delete
  using (
    bucket_id in ('products', 'categories', 'brands')
    and public.is_admin()
  );

-- Les utilisateurs connectés gèrent leur propre avatar
drop policy if exists "Avatar perso" on storage.objects;
create policy "Avatar perso" on storage.objects
  for all
  using (bucket_id = 'avatars' and auth.role() = 'authenticated')
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
