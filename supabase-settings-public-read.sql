-- =============================================================
-- FIX — Lecture publique de la table `settings`
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Problème corrigé : la policy de lecture était réservée aux admins
-- (`for select using (public.is_admin())`). Le site public lit `settings`
-- en tant que VISITEUR non-admin (bannières, images de « Gestion des pages »,
-- frais de livraison, coordonnées, réseaux sociaux…) → la lecture renvoyait
-- 0 ligne et le site retombait toujours sur les images/valeurs par défaut.
--
-- Toutes les clés de `settings` sont destinées à l'affichage public
-- (aucun secret n'y est stocké), donc la lecture peut être ouverte à tous.
-- =============================================================

-- Ancienne policy de lecture (admin-only) — on la supprime.
drop policy if exists "Admin lit les paramètres" on public.settings;

-- Lecture publique.
drop policy if exists "Lecture publique des paramètres" on public.settings;
create policy "Lecture publique des paramètres" on public.settings
  for select using (true);

-- Écriture réservée aux admins (idempotent).
drop policy if exists "Admin gère paramètres" on public.settings;
create policy "Admin gère paramètres" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());
