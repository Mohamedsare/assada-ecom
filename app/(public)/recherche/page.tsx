import { Suspense } from "react";
import RechercheContent from "./RechercheContent";

export const metadata = {
  title: "Recherche",
  description: "Recherchez des produits sur RYTA — Boutique en ligne à Casablanca.",
};

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-[#020B27] text-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse mb-4" />
            <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <RechercheContent />
    </Suspense>
  );
}
