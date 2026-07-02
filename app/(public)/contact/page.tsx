import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — Service client Assada à Casablanca",
  description:
    "Contactez Assada : téléphone, email et WhatsApp. Service client 7j/7 pour vos commandes, livraisons et questions partout à Casablanca. Réponse rapide à Casablanca.",
  keywords: [
    "contact Assada", "service client Casablanca", "WhatsApp boutique Casablanca",
    "aide commande Casablanca", "support e-commerce Casablanca",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Assada",
    description: "Une question ? Contactez notre service client 7j/7 partout à Casablanca.",
    type: "website",
    locale: "fr_MA",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
