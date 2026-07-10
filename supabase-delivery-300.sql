-- =============================================================
-- RYTA — Livraison gratuite à partir de 300 DH
-- À exécuter dans Supabase → SQL Editor (met à jour la base LIVE).
-- Le seed de supabase-schema.sql ne s'applique qu'aux nouvelles bases ;
-- ici on corrige la ligne `settings` existante.
-- (Équivalent : Admin → Paramètres → « Livraison gratuite à partir de ».)
-- =============================================================

-- Seuil de livraison gratuite = 300 DH
update public.settings
set value = '300'::jsonb, updated_at = now()
where key = 'free_delivery_threshold';

-- Frais de livraison (sous le seuil) — ajustez selon vos vrais frais.
update public.settings
set value = '30'::jsonb, updated_at = now()
where key = 'delivery_fee';

-- Vérification
-- select key, value from public.settings where key in ('free_delivery_threshold','delivery_fee');
