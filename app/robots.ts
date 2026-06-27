import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Robots géré par Next (app/robots.ts) → exposé sur /robots.txt
export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Espaces privés, transactionnels ou sans valeur SEO (pages fines / dupliquées)
        disallow: [
          "/admin",
          "/compte",
          "/checkout",
          "/panier",
          "/validation-commande",
          "/connexion",
          "/inscription",
          "/auth/",
          "/recherche",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
