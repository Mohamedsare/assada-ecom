import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photos jusqu'à 3 Mo + vidéos de bannière (slider d'accueil) → marge à 20 Mo
      bodySizeLimit: "20mb",
    },
    // Le proxy Next.js bufferise le corps des requêtes (défaut 10 Mo) : sans ça, les
    // uploads vidéo > 10 Mo sont tronqués → « Unexpected end of form ». On aligne sur 20 Mo.
    proxyClientMaxBodySize: "20mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Images uploadées dans Supabase Storage (buckets products/categories/brands…)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
