import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — Service client Odm's Shopping au Gabon",
  description:
    "Contactez Odm's Shopping : téléphone, email et WhatsApp. Service client 7j/7 pour vos commandes, livraisons et questions partout au Gabon. Réponse rapide à Libreville.",
  keywords: [
    "contact Odm's Shopping", "service client Gabon", "WhatsApp boutique Gabon",
    "aide commande Libreville", "support e-commerce Gabon",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Odm's Shopping",
    description: "Une question ? Contactez notre service client 7j/7 partout au Gabon.",
    type: "website",
    locale: "fr_GA",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
