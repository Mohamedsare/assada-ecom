import { BarChart3 } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Rapports & Statistiques" };

export default function Page() {
  return (
    <ComingSoon
      title="Rapports & Statistiques"
      description="Analysez les performances de votre boutique en détail"
      icon={BarChart3}
      features={["Évolution des ventes", "Meilleures catégories et produits", "Analyse par période", "Export Excel / PDF", "Taux de conversion détaillé"]}
    />
  );
}
