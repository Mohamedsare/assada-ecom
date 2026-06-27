import { redirect } from "next/navigation";

// "Réglages boutique" et "Paramètres" géraient la même chose.
// On unifie sur une seule page pour éviter la duplication.
export default function ReglagesPage() {
  redirect("/admin/parametres");
}
