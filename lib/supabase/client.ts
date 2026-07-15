import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Upload d'un fichier vers Supabase Storage **directement depuis le navigateur**.
 *
 * On contourne ainsi les Server Actions Next.js, qui transitent par une fonction
 * Vercel plafonnée à 4,5 Mo (limite plateforme) → un `413` sur les vidéos.
 * Ici la requête va droit à Supabase Storage : seule compte la limite du bucket
 * (50 Mo pour `products`) et la RLS admin (`is_admin()`), satisfaite via la
 * session cookie de l'utilisateur connecté.
 */
export async function uploadToBucket(
  bucket: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (!file || file.size === 0) return { error: "Aucun fichier" };

  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("uploadToBucket:", error);
    return { error: error.message || "Échec de l'upload." };
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: publicUrl };
}
