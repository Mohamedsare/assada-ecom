-- Incrément sécurisé du compteur d'utilisation d'un coupon.
-- L'écriture directe sur `coupons` est réservée aux admins (RLS « Admin gère coupons »),
-- donc on passe par une fonction SECURITY DEFINER appelée depuis createOrder().
-- À exécuter une fois dans l'éditeur SQL Supabase.

create or replace function public.increment_coupon_usage(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.coupons
     set used_count = used_count + 1
   where upper(code) = upper(p_code)
     and is_active = true;
$$;

-- Autorise l'appel par les visiteurs (clients passant commande) et les utilisateurs connectés.
grant execute on function public.increment_coupon_usage(text) to anon, authenticated;
