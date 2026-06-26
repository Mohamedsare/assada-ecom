import type { Metadata } from "next";

import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import HomeFooter from "@/components/layout/HomeFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import BannersSection from "@/components/sections/BannersSection";
import AdvantagesSection from "@/components/sections/AdvantagesSection";
import SocialSection from "@/components/sections/SocialSection";
import ProductCarousel from "@/components/product/ProductCarousel";

import { getProducts } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Odm's Shopping — Boutique en ligne n°1 au Gabon",
  description:
    "Commandez facilement vos chaussures, vêtements, accessoires et produits électroniques avec livraison rapide partout au Gabon. Paiement à la livraison disponible.",
  keywords: ["boutique en ligne Gabon", "shopping Gabon", "chaussures Libreville", "Odm's Shopping"],
};

export default async function HomePage() {
  const [latestProducts, promoProducts] = await Promise.all([
    getProducts({ limit: 8 }),
    getProducts({ is_promo: true, limit: 8 }),
  ]);

  return (
    <>
      <TopBar />
      <Header />

      <main className="flex-1 bg-white pb-16 lg:pb-0">

        {/* 1 — Slider hero */}
        <HeroSection />

        {/* 2 — Catégories */}
        <CategoriesSection />

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

      </main>

      <HomeFooter />
      <WhatsAppButton />
      <MobileBottomNav />
    </>
  );
}
