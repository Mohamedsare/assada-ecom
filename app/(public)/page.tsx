import type { Metadata } from "next";

import HeroSection from "@/components/sections/HeroSection";
import FindUsSection from "@/components/sections/FindUsSection";
import HomeShowcase from "@/components/sections/home/HomeShowcase";
import NosUnivers from "@/components/sections/home/NosUnivers";
import FeatureProduct from "@/components/sections/home/FeatureProduct";
import CommunityStories from "@/components/sections/home/CommunityStories";
import { buildUnivers } from "@/components/sections/home/buildUnivers";
import ProductCarousel from "@/components/product/ProductCarousel";

import { getProducts, getCategories } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "RYTA — Boutique en ligne n°1 à Casablanca",
  description:
    "Commandez facilement vos produits de beauté, compléments alimentaires et produits du terroir marocain avec livraison partout au Maroc en 24 à 72h, gratuite dès 300 DH. Paiement à la livraison disponible.",
  keywords: ["boutique en ligne Casablanca", "produits de beauté Casablanca", "compléments alimentaires Casablanca", "produits du terroir marocain", "RYTA"],
};

export default async function HomePage() {
  const [allProducts, latestProducts, allCategories] = await Promise.all([
    getProducts(),
    getProducts({ limit: 8 }),
    getCategories(),
  ]);

  const univers = buildUnivers(allProducts, allCategories);

  // Produit signature : un produit vedette (sinon 1er avec image).
  const withImage = allProducts.filter((p) => p.main_image_url);
  const featureProduct = withImage.find((p) => p.is_featured) ?? withImage[0] ?? null;

  // Même page d'accueil sur desktop et mobile (les sections sont responsives).
  return (
    <>
      {/* 1 — Slider hero */}
      <HeroSection />

      {/* 2 — Nos Univers (axes → sous-catégories → produits) — juste après la bannière */}
      {univers.length > 0 && <NosUnivers univers={univers} />}

      {/* Produit signature */}
      {featureProduct && <FeatureProduct product={featureProduct} />}

      {/* 5 — Derniers produits ajoutés */}
      {latestProducts.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel
              label="Nouveautés"
              title="Les derniers produits ajoutés"
              subtitle="Mis à jour cette semaine"
              products={latestProducts}
              viewAllHref="/boutique"
              viewAllColor="text-green"
            />
          </div>
        </section>
      )}

      {/* Sections éditoriales façon apia */}
      <HomeShowcase products={allProducts} categories={allCategories} />

      {/* Histoires de la communauté */}
      <CommunityStories products={allProducts} />

      {/* 9 — Trouvez notre boutique (carte + contact) */}
      <FindUsSection />
    </>
  );
}
