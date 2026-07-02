import type { MetadataRoute } from "next";
import { SITE_URL, CATEGORIES } from "@/lib/constants";
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

  // 2 — Pages catégories (filtres boutique = vraies pages indexables)
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${base}/boutique?categorie=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
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
