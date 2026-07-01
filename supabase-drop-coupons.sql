-- =============================================================
-- SUPPRESSION COMPLÈTE de la fonctionnalité coupons
-- ⚠️ DESTRUCTIF : supprime la table `coupons` et tous les codes existants.
-- À exécuter une seule fois dans Supabase → SQL Editor.
-- =============================================================

-- 1) Fonction d'incrément d'usage (définie dans supabase-coupon-usage.sql)
drop function if exists public.increment_coupon_usage(text);

-- 2) Table coupons (CASCADE supprime aussi ses policies RLS :
--    « Lecture publique coupons actifs » et « Admin gère coupons »)
drop table if exists public.coupons cascade;
