-- =============================================
-- Ajout du téléphone aux messages de contact
-- (formulaire "Trouvez notre boutique" de la page d'accueil)
-- À exécuter dans Supabase → SQL Editor.
-- =============================================

alter table public.contact_messages
  add column if not exists phone text;
