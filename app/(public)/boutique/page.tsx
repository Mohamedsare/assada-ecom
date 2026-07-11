import { Suspense } from "react";
import BoutiqueContent from "./BoutiqueContent";
import { getProducts, getCategories, getBrands } from "@/lib/supabase/queries";

export const metadata = {
  title: "Boutique",
  description: "Découvrez toute la sélection de produits RYTA à Casablanca.",
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
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mx-auto mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <BoutiqueContent products={products} categories={categories} brands={brands} />
    </Suspense>
  );
}
