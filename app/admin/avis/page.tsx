import { Star } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Avis clients" };

export default function Page() {
  return (
    <ComingSoon
      title="Avis clients"
      description="Modérez et gérez les avis laissés par vos clients"
      icon={Star}
      features={["Approbation des avis", "Notes de 1 à 5 étoiles", "Réponses aux avis", "Avis par produit", "Signalement d'abus"]}
    />
  );
}
