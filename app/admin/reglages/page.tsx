import { Store } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Réglages boutique" };

export default function Page() {
  return (
    <ComingSoon
      title="Réglages boutique"
      description="Configuration avancée et personnalisation de la boutique"
      icon={Store}
      features={["Logo et identité visuelle", "SEO global", "Coordonnées de localisation", "Message WhatsApp par défaut", "Devise et langue"]}
    />
  );
}
