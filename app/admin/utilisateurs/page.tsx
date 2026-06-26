import { UserCog } from "lucide-react";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Utilisateurs admins" };

export default function Page() {
  return (
    <ComingSoon
      title="Utilisateurs admins"
      description="Gérez les comptes administrateurs et leurs permissions"
      icon={UserCog}
      features={["Rôles : admin, super admin", "Gestion des permissions", "Ajout / suppression d'admins", "Historique des connexions", "Sécurité des comptes"]}
    />
  );
}
