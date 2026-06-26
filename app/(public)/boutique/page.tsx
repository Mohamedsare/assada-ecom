import { Suspense } from "react";
import BoutiqueContent from "./BoutiqueContent";
import { getProducts, getCategories, getBrands } from "@/lib/supabase/queries";

export const metadata = {
  title: "Boutique",
  description: "Découvrez toute la sélection de produits Odm's Shopping au Gabon.",
};

export default async function BoutiquePage() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-gradient-to-r from-[#020B27] to-[#0F172A] text-white py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <BoutiqueContent products={products} categories={categories} brands={brands} />
    </Suspense>
  );
}
