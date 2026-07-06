import type { Metadata } from "next";
import { Suspense } from "react";

import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import BannersSection from "@/components/sections/BannersSection";
import AdvantagesSection from "@/components/sections/AdvantagesSection";
import OrderStepsSection from "@/components/sections/OrderStepsSection";
import SocialSection from "@/components/sections/SocialSection";
import FindUsSection from "@/components/sections/FindUsSection";
import ProductCarousel from "@/components/product/ProductCarousel";

import BoutiqueContent from "./boutique/BoutiqueContent";
import { getProducts, getCategories, getBrands } from "@/lib/supabase/queries";
import { CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "RYTA — Boutique cosmétique n°1 à Casablanca",
  description:
    "Commandez facilement vos parfums, soins visage & cheveux, maquillage et produits d'hygiène avec livraison rapide partout à Casablanca. Paiement à la livraison disponible.",
  keywords: ["boutique cosmétique Casablanca", "parfums Casablanca", "maquillage Casablanca", "RYTA"],
};

export default async function HomePage() {
  const [allProducts, latestProducts, promoProducts, allCategories, brands] = await Promise.all([
    getProducts(),
    getProducts({ limit: 8 }),
    getProducts({ is_promo: true, limit: 8 }),
    getCategories(),
    getBrands(),
  ]);

  // Catégories de tête (parent_id vide) avec leur image gérée en admin ; emoji de repli.
  const emojiBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.emoji]));
  const categoryItems = allCategories
    .filter((c) => !c.parent_id)
    .map((c) => ({ name: c.name, slug: c.slug, image: c.image_url, emoji: emojiBySlug[c.slug] ?? "🛍️" }));

  return (
    <>
      {/* Mobile — la boutique fait office de page d'accueil */}
      <div className="lg:hidden">
        <Suspense fallback={
          <div className="min-h-screen bg-[#F8FAFC]">
            <div className="bg-gradient-to-r from-[#020B27] to-[#0F172A] text-white py-10 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          </div>
        }>
          <BoutiqueContent
            products={allProducts}
            categories={allCategories}
            brands={brands}
            bannerTitle="Bienvenue chez RYTA"
            bannerSubtitle="Parfums, soins, maquillage & plus — livrés partout à Casablanca. Paiement à la livraison."
          />
        </Suspense>
      </div>

      {/* Desktop — l'ancienne page d'accueil reste la page d'accueil */}
      <div className="hidden lg:block">
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

        {/* 7 — Commander en quelques clics */}
        <OrderStepsSection />

        {/* 8 — Réseaux sociaux */}
        <SocialSection />

        {/* 9 — Trouvez notre boutique (carte + contact) */}
        <FindUsSection />
      </div>
    </>
  );
}
