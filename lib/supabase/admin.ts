import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase à privilèges élevés (clé service_role).
 * ⚠️ SERVEUR UNIQUEMENT — ne jamais importer côté client.
 * Utilisé pour les opérations d'administration (création de comptes employés).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local"
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
