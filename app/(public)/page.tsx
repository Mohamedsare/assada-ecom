import type { Metadata } from "next";

import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import OrderStepsSection from "@/components/sections/OrderStepsSection";
import FindUsSection from "@/components/sections/FindUsSection";
import HomeShowcase from "@/components/sections/home/HomeShowcase";
import NosUnivers from "@/components/sections/home/NosUnivers";
import ReassuranceBar from "@/components/sections/home/ReassuranceBar";
import BeauteBienEtre from "@/components/sections/home/BeauteBienEtre";
import FeatureProduct from "@/components/sections/home/FeatureProduct";
import CommunityStories from "@/components/sections/home/CommunityStories";
import { buildUnivers } from "@/components/sections/home/buildUnivers";
import { buildBeautyCats } from "@/components/sections/home/buildBeautyCats";
import ProductCarousel from "@/components/product/ProductCarousel";

import { getProducts, getCategories } from "@/lib/supabase/queries";
import { CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "RYTA — Boutique en ligne n°1 à Casablanca",
  description:
    "Commandez facilement vos produits de beauté, compléments alimentaires et produits du terroir marocain avec livraison partout au Maroc en 24 à 72h, gratuite dès 500 DH. Paiement à la livraison disponible.",
  keywords: ["boutique en ligne Casablanca", "produits de beauté Casablanca", "compléments alimentaires Casablanca", "produits du terroir marocain", "RYTA"],
};

export default async function HomePage() {
  const [allProducts, latestProducts, allCategories] = await Promise.all([
    getProducts(),
    getProducts({ limit: 8 }),
    getCategories(),
  ]);

  // Catégories de tête (parent_id vide) avec leur image gérée en admin ; emoji de repli.
  const emojiBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.emoji]));
  const categoryItems = allCategories
    .filter((c) => !c.parent_id)
    .map((c) => ({ name: c.name, slug: c.slug, image: c.image_url, emoji: emojiBySlug[c.slug] ?? "🛍️" }));

  const univers = buildUnivers(allProducts, allCategories);
  const beautyCats = buildBeautyCats(allProducts, allCategories);

  // Produit signature : un produit vedette (sinon 1er avec image).
  const withImage = allProducts.filter((p) => p.main_image_url);
  const featureProduct = withImage.find((p) => p.is_featured) ?? withImage[0] ?? null;

  // Même page d'accueil sur desktop et mobile (les sections sont responsives).
  return (
    <>
      {/* 1 — Slider hero */}
      <HeroSection />

      {/* 2 — Nos Univers (les 3 axes) — juste après la bannière */}
      {univers.length > 0 && <NosUnivers univers={univers} />}

      {/* Réassurance — juste après Nos Univers */}
      <ReassuranceBar />

      {/* Beauté & bien-être — juste avant les catégories */}
      {beautyCats.length >= 2 && <BeauteBienEtre cats={beautyCats} />}

      {/* Produit signature — juste après Beauté & bien-être */}
      {featureProduct && <FeatureProduct product={featureProduct} />}

      {/* 3 — Catégories */}
      <CategoriesSection items={categoryItems} />

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

      {/* 7 — Commander en quelques clics — juste après Histoires de la communauté */}
      <OrderStepsSection />

      {/* 9 — Trouvez notre boutique (carte + contact) */}
      <FindUsSection />
    </>
  );
}
