-- « Histoires de la communauté » : marque un produit comme carte vidéo à afficher
-- dans la section d'accueil. La carte n'apparaît que si le produit a aussi une video_url.
alter table products
  add column if not exists is_story boolean default false;

-- (Optionnel) Ré-afficher d'anciens produits qui ont déjà une vidéo :
-- update products set is_story = true where video_url is not null;
