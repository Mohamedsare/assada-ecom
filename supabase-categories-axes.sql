-- =============================================================
-- RYTA — 3 grands axes de catégories + sous-catégories
-- À exécuter dans Supabase → SQL Editor (une seule fois ; ré-exécutable).
--   1) Beauté
--   2) Compléments alimentaires
--   3) Produits locaux
-- Re-parente aussi les catégories cosmétiques existantes sous « Beauté ».
-- =============================================================

-- 1) Les 3 axes (niveau 1, parent_id = null)
insert into public.categories (name, slug, parent_id, is_active, sort_order) values
  ('Beauté',                   'beaute',                   null, true, 1),
  ('Compléments alimentaires', 'complements-alimentaires', null, true, 2),
  ('Produits locaux',          'produits-locaux',          null, true, 3)
on conflict (slug) do nothing;

-- 2) Sous-catégories « Produits locaux »
insert into public.categories (name, slug, parent_id, is_active, sort_order)
select v.name, v.slug, (select id from public.categories where slug = 'produits-locaux'), true, v.ord
from (values
  ('Miels',                     'miels',                    1),
  ('Huiles alimentaires',       'huiles-alimentaires',      2),
  ('Amlou & pâtes à tartiner',  'amlou-pates-a-tartiner',   3),
  ('Épices & aromates',         'epices-aromates',          4),
  ('Fruits secs & dattes',      'fruits-secs-dattes',       5),
  ('Olives & conserves',        'olives-conserves',         6),
  ('Confitures & sirops',       'confitures-sirops',        7),
  ('Thés & infusions',          'thes-infusions',           8),
  ('Eaux florales & hydrolats', 'eaux-florales-hydrolats',  9)
) as v(name, slug, ord)
on conflict (slug) do nothing;

-- 3) Sous-catégories « Compléments alimentaires » (préfixe complements- pour éviter
--    toute collision de slug avec les catégories beauté)
insert into public.categories (name, slug, parent_id, is_active, sort_order)
select v.name, v.slug, (select id from public.categories where slug = 'complements-alimentaires'), true, v.ord
from (values
  ('Beauté (peau, cheveux, ongles)', 'complements-beaute',          1),
  ('Vitalité & énergie',             'complements-vitalite-energie', 2),
  ('Immunité & défenses',            'complements-immunite',         3),
  ('Minceur & détox',                'complements-minceur-detox',    4),
  ('Digestion & transit',            'complements-digestion',        5),
  ('Sommeil & stress',               'complements-sommeil-stress',   6),
  ('Articulations & os',             'complements-articulations-os', 7),
  ('Cheveux & ongles',               'complements-cheveux-ongles',   8),
  ('Femme / Homme',                  'complements-femme-homme',      9)
) as v(name, slug, ord)
on conflict (slug) do nothing;

-- 4) Sous-catégories « Beauté » — UPSERT : crée les manquantes ET re-parente
--    les existantes (parfums, maquillage…) sous « Beauté » en une seule passe.
insert into public.categories (name, slug, parent_id, is_active, sort_order)
select v.name, v.slug, (select id from public.categories where slug = 'beaute'), true, v.ord
from (values
  ('Parfums',                 'parfums',              1),
  ('Soins du visage',         'soins-visage',         2),
  ('Soins du corps',          'soins-corps',          3),
  ('Soins des cheveux',       'soins-cheveux',        4),
  ('Maquillage',              'maquillage',           5),
  ('Hygiène',                 'hygiene',              6),
  ('Traditionnels / Hammam',  'traditionnels-hammam', 7),
  ('Accessoires beauté',      'accessoires',          8),
  ('Coffrets & cadeaux',      'cadeaux',              9),
  ('Bien-être',               'bien-etre',           10)
) as v(name, slug, ord)
on conflict (slug) do update
  set parent_id = excluded.parent_id,
      is_active = true,
      updated_at = now();

-- 6) Vérification rapide de l'arborescence (optionnel)
-- select p.name as axe, c.name as sous_categorie
-- from public.categories c
-- join public.categories p on p.id = c.parent_id
-- where p.slug in ('beaute','complements-alimentaires','produits-locaux')
-- order by p.sort_order, c.sort_order;
