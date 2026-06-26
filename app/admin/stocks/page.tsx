import { Boxes } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Stocks" };

export default function Page() {
  return (
    <ComingSoon
      title="Gestion des stocks"
      description="Suivez et gérez les niveaux de stock de vos produits"
      icon={Boxes}
      features={["Niveaux de stock par produit", "Alertes stock faible", "Gestion des variantes", "Historique des mouvements", "Réapprovisionnement"]}
    />
  );
}
