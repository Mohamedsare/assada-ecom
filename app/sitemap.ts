import type { MetadataRoute } from "next";
import { SITE_URL, AXES } from "@/lib/constants";
import { getProductSitemapData } from "@/lib/supabase/queries";

// Régénéré au plus toutes les heures.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  // 1 — Pages publiques principales
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,               lastModified: now, changeFrequency: "daily",   priority: 1 },
    { url: `${base}/boutique`,       lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/nouveautes`,     lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/promotions`,     lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/contact`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2 — Pages catégories (filtres boutique = vraies pages indexables).
  //     On aplatit l'arbre : axes (priorité 0.8) → catégories → sous-catégories (0.6).
  const categorySlugs: { slug: string; priority: number }[] = [];
  for (const axis of AXES) {
    categorySlugs.push({ slug: axis.slug, priority: 0.8 });
    for (const cat of axis.children) {
      categorySlugs.push({ slug: cat.slug, priority: 0.7 });
      for (const leaf of cat.children ?? []) {
        categorySlugs.push({ slug: leaf.slug, priority: 0.6 });
      }
    }
  }
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map(({ slug, priority }) => ({
    url: `${base}/boutique?categorie=${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  // 3 — Fiches produits (résilient : [] si la base est indisponible)
  const products = await getProductSitemapData();
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produit/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
