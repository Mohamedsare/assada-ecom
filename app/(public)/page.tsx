import type { Metadata } from "next";

import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import BannersSection from "@/components/sections/BannersSection";
import AdvantagesSection from "@/components/sections/AdvantagesSection";
import SocialSection from "@/components/sections/SocialSection";
import ProductCarousel from "@/components/product/ProductCarousel";

import { getProducts, getCategories } from "@/lib/supabase/queries";
import { CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Assada — Boutique cosmétique n°1 à Casablanca",
  description:
    "Commandez facilement vos parfums, soins visage & cheveux, maquillage et produits d'hygiène avec livraison rapide partout à Casablanca. Paiement à la livraison disponible.",
  keywords: ["boutique cosmétique Casablanca", "parfums Casablanca", "maquillage Casablanca", "Assada"],
};

export default async function HomePage() {
  const [latestProducts, promoProducts, allCategories] = await Promise.all([
    getProducts({ limit: 8 }),
    getProducts({ is_promo: true, limit: 8 }),
    getCategories(),
  ]);

  // Catégories de tête (parent_id vide) avec leur image gérée en admin ; emoji de repli.
  const emojiBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.emoji]));
  const categoryItems = allCategories
    .filter((c) => !c.parent_id)
    .map((c) => ({ name: c.name, slug: c.slug, image: c.image_url, emoji: emojiBySlug[c.slug] ?? "🛍️" }));

  return (
    <>
      {/* 1 — Slider hero */}
      <HeroSection />

      {/* 2 — Catégories */}
      <CategoriesSection items={categoryItems} />

      {/* 3 — Bannières promos */}
      <BannersSection />

      {/* 4 — Avantages */}
      <AdvantagesSection />

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

      {/* 6 — Meilleures offres */}
      {promoProducts.length > 0 && (
        <section className="py-10 px-4 bg-gray-light">
          <div className="max-w-7xl mx-auto">
            <ProductCarousel
              label="Promotions"
              title="Les meilleures offres du moment"
              subtitle="Offres valables jusqu'à épuisement des stocks"
              products={promoProducts}
              viewAllHref="/promotions"
              viewAllColor="text-red"
            />
          </div>
        </section>
      )}

      {/* 7 — Réseaux sociaux */}
      <SocialSection />
    </>
  );
}
