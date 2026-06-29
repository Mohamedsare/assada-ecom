-- =============================================================
-- MÉDIAS PRODUITS — plusieurs photos (max 5) + 1 vidéo
-- À exécuter dans Supabase → SQL Editor (une seule fois).
-- =============================================================

-- 1) Champ vidéo sur les produits (la table product_images existe déjà pour les photos)
alter table public.products
  add column if not exists video_url text;

-- 2) (Optionnel) garde-fou : au maximum 5 photos par produit.
--    Empêche d'insérer une 6e image pour un même produit.
create or replace function public.check_max_product_images()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.product_images where product_id = new.product_id) >= 5 then
    raise exception 'Un produit ne peut pas avoir plus de 5 photos.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_max_product_images on public.product_images;
create trigger trg_max_product_images
  before insert on public.product_images
  for each row execute function public.check_max_product_images();
