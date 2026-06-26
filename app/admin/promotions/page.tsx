import { Ticket } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Promotions & Coupons" };

export default function Page() {
  return (
    <ComingSoon
      title="Promotions & Coupons"
      description="Créez et gérez vos codes promo et campagnes promotionnelles"
      icon={Ticket}
      features={["Codes promo (% ou montant fixe)", "Date d'expiration", "Limite d'utilisation", "Montant minimum de commande", "Suivi des utilisations"]}
    />
  );
}
