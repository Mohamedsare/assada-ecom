import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import BannersSection from "@/components/sections/BannersSection";
import AdvantagesSection from "@/components/sections/AdvantagesSection";
import SocialSection from "@/components/sections/SocialSection";
import { HomeLatestProducts, HomePromoProducts } from "@/components/sections/HomeProductsSection";

export const metadata: Metadata = {
  title: "Odm's Shopping — Boutique en ligne n°1 au Gabon",
  description:
    "Commandez facilement vos chaussures, vêtements, accessoires et produits électroniques avec livraison rapide partout au Gabon. Paiement à la livraison disponible.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AdvantagesSection />
      <CategoriesSection />
      <BannersSection />
      <HomeLatestProducts />
      <HomePromoProducts />
      <SocialSection />
    </>
  );
}
