import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — Service client RYTA à Casablanca",
  description:
    "Contactez RYTA : téléphone, email et WhatsApp. Service client 7j/7 pour vos commandes, livraisons et questions partout au Maroc. Réponse rapide.",
  keywords: [
    "contact RYTA", "service client Casablanca", "WhatsApp boutique Casablanca",
    "aide commande Casablanca", "support e-commerce Casablanca",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — RYTA",
    description: "Une question ? Contactez notre service client 7j/7 partout au Maroc.",
    type: "website",
    locale: "fr_MA",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
