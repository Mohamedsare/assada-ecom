-- ─────────────────────────────────────────────────────────────────────────────
-- Active Supabase Realtime sur les tables suivies par l'admin (mises à jour
-- en temps réel du tableau de bord, des commandes, paiements, produits, etc.).
--
-- À exécuter UNE FOIS dans Supabase → SQL Editor. Idempotent : réexécutable
-- sans erreur (n'ajoute une table à la publication que si absente).
--
-- La sécurité reste assurée par RLS : chaque abonné ne reçoit que les
-- changements des lignes qu'il a le droit de lire (les admins voient tout).
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
  tables text[] := array[
    'orders',
    'order_items',
    'payments',
    'products',
    'product_variants',
    'profiles',
    'categories',
    'brands',
    'reviews',
    'contact_messages',
    'settings',
    'delivery_agents'
  ];
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;

-- Vérification : liste les tables publiées par Realtime.
select tablename
from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public'
order by tablename;
