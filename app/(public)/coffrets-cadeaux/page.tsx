import { Suspense } from "react";
import CoffretsContent from "./CoffretsContent";
import { getPacks } from "@/lib/supabase/queries";

export const metadata = {
  title: "Coffrets cadeaux",
  description: "Nos packs : des ensembles de produits RYTA à offrir ou à s'offrir, à commander en une seule fois. Livraison à Casablanca, paiement à la livraison.",
};

export default async function CoffretsCadeauxPage() {
  const packs = await getPacks();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="h-9 w-64 bg-gray-100 rounded-lg animate-pulse mx-auto mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    }>
      <CoffretsContent packs={packs} />
    </Suspense>
  );
}
