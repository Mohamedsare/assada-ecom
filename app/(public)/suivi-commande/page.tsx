import { Suspense } from "react";
import SuiviContent from "./SuiviContent";

export const metadata = {
  title: "Suivi de commande",
  description: "Suivez l'état de votre commande Odm's Shopping partout au Gabon.",
};

export default function SuiviCommandePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-[#020B27] text-white py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-10 w-64 bg-white/20 rounded-xl animate-pulse mx-auto mb-4" />
          </div>
        </div>
      </div>
    }>
      <SuiviContent />
    </Suspense>
  );
}
