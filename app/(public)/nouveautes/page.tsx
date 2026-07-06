import type { Metadata } from "next";
import { Suspense } from "react";
import NouveautesContent from "./NouveautesContent";
import { getProducts, getCategories } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Nouveautés | RYTA",
  description: "Découvrez les dernières nouveautés d'RYTA à Casablanca. Les produits les plus récents arrivent chaque semaine.",
};

export default async function NouveautesPage() {
  const [products, categories] = await Promise.all([
    getProducts({ is_new: true }),
    getCategories(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="h-56 bg-night animate-pulse" />
        <div className="h-32 bg-white border-b border-gray-100 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <NouveautesContent products={products} categories={categories} />
    </Suspense>
  );
}
