import { Truck } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Livreurs & Tracking" };

export default function Page() {
  return (
    <ComingSoon
      title="Livreurs & Tracking"
      description="Gérez vos livreurs et suivez les livraisons en temps réel"
      icon={Truck}
      features={["Assignation des livreurs", "Géolocalisation en temps réel", "Carte de suivi", "Statut de livraison", "Distance boutique-client"]}
    />
  );
}
