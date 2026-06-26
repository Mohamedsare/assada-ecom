import { MessageSquare } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Messages" };

export default function Page() {
  return (
    <ComingSoon
      title="Messages"
      description="Consultez et répondez aux messages de vos clients"
      icon={MessageSquare}
      features={["Messages du formulaire de contact", "Intégration WhatsApp", "Marquage lu / non lu", "Réponses rapides", "Historique des conversations"]}
    />
  );
}
