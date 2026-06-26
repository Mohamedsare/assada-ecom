import { CreditCard } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Paiements" };

export default function Page() {
  return (
    <ComingSoon
      title="Paiements"
      description="Suivez les paiements et transactions de vos commandes"
      icon={CreditCard}
      features={["Méthode de paiement", "Statut des paiements", "Références de transaction", "Montants encaissés", "Espèces, Airtel Money, Moov Money"]}
    />
  );
}
