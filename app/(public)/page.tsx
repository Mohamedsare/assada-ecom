import type { Metadata } from "next";

import HeroSection from "@/components/sections/HeroSection";
import FindUsSection from "@/components/sections/FindUsSection";
import HomeShowcase from "@/components/sections/home/HomeShowcase";
import NosUnivers from "@/components/sections/home/NosUnivers";
import CommunityStories from "@/components/sections/home/CommunityStories";
import PromoBanners from "@/components/sections/home/PromoBanners";
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

  const withImage = allProducts.filter((p) => p.main_image_url);

  // Meilleures ventes : produits vedettes ; à défaut, les mieux notés.
  const featured = withImage.filter((p) => p.is_featured);
  const bestSellers = (featured.length >= 3
    ? featured
    : [...withImage].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
  ).slice(0, 12);

  // Promotions : produits marqués en promo.
  const promoProducts = withImage.filter((p) => p.is_promo).slice(0, 12);

  // Même page d'accueil sur desktop et mobile (les sections sont responsives).
  return (
    <>
      {/* 1 — Slider hero */}
      <HeroSection />

      {/* 2 — Nos Univers (axes → sous-catégories → produits) — juste après la bannière */}
      {univers.length > 0 && <NosUnivers univers={univers} />}

      {/* 1 — Nos meilleures ventes */}
      {bestSellers.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel
              title="Nos meilleures ventes"
              products={bestSellers}
              singleOnMobile
              autoAdvanceMs={3000}
            />
          </div>
        </section>
      )}

      {/* 2 — Nos offres et promotions */}
      {promoProducts.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel
              title="Nos promotions"
              products={promoProducts}
              singleOnMobile
              autoAdvanceMs={3000}
            />
          </div>
        </section>
      )}

      {/* 3 — Nos nouveautés */}
      {latestProducts.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel
              title="Nos nouveautés"
              products={latestProducts}
              singleOnMobile
              autoAdvanceMs={3000}
            />
          </div>
        </section>
      )}

      {/* Offres (bannières commerciales) */}
      <PromoBanners />

      {/* Sections éditoriales façon apia */}
      <HomeShowcase products={allProducts} categories={allCategories} />

      {/* Histoires de la communauté */}
      <CommunityStories products={allProducts} />

      {/* 9 — Trouvez notre boutique (carte + contact) */}
      <FindUsSection />
    </>
  );
}
