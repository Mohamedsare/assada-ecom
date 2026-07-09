import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import FaqAccordion, { type FaqItem } from "@/components/legal/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes | RYTA Casablanca",
  description:
    "Réponses aux questions fréquentes sur RYTA : commandes, livraison partout au Maroc, paiement à la livraison, retours, authenticité des produits et commande via WhatsApp.",
  keywords: ["FAQ RYTA", "aide commande Casablanca", "livraison cosmétique Casablanca"],
  alternates: { canonical: "/faq" },
  openGraph: { title: "FAQ — RYTA", type: "website", locale: "fr_MA" },
};

const FAQ: FaqItem[] = [
  {
    q: "Dois-je créer un compte pour commander ?",
    a: "Non. Vous pouvez commander librement sans créer de compte. Créer un compte reste possible et vous permet de suivre vos commandes et de retrouver votre historique.",
  },
  {
    q: "Quels sont les modes de paiement disponibles ?",
    a: "Le paiement s'effectue à la livraison, en espèces, directement auprès du livreur au moment de la réception de votre commande.",
  },
  {
    q: "Livrez-vous partout au Maroc ?",
    a: "Oui. Nous livrons partout au Maroc — Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et toutes les villes du Royaume.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "La livraison s'effectue partout au Maroc généralement sous 24 à 72 heures ouvrées après confirmation de votre commande par téléphone.",
  },
  {
    q: "Quels sont les frais de livraison ?",
    a: "Les frais sont affichés dans votre panier avant paiement. La livraison est gratuite à partir de 500 DH d'achat, partout au Maroc.",
  },
  {
    q: "Vos produits sont-ils authentiques ?",
    a: "Oui, tous nos cosmétiques, parfums et soins sont 100 % authentiques et sélectionnés avec soin auprès de sources fiables.",
  },
  {
    q: "Puis-je retourner un produit ?",
    a: "Vous disposez d'un délai de 7 jours (loi 31-08) pour vous rétracter. Pour des raisons d'hygiène, les produits cosmétiques ouverts ou descellés ne peuvent pas être repris. Voir la page Livraison & Retours.",
  },
  {
    q: "Comment commander via WhatsApp ?",
    a: "Cliquez sur le bouton WhatsApp présent sur le site (ou sur une fiche produit) : votre message est prérempli. Notre équipe finalise la commande avec vous.",
  },
  {
    q: "Comment connaître l'état de ma commande ?",
    a: "Notre équipe vous contacte directement sur WhatsApp après votre commande pour la confirmer et organiser la livraison. Vous pouvez aussi nous écrire sur WhatsApp avec votre numéro de commande à tout moment.",
  },
];

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LegalPage
        title="Questions fréquentes"
        subtitle="Retrouvez les réponses aux questions les plus courantes. Vous ne trouvez pas la vôtre ? Contactez-nous."
      >
        <FaqAccordion items={FAQ} />

        <h2>Vous avez une autre question ?</h2>
        <p>
          Notre service client est à votre écoute 7j/7. Contactez-nous via la{" "}
          <Link href="/contact">page Contact</Link>, par email ou par WhatsApp — nous répondons rapidement.
        </p>
      </LegalPage>
    </>
  );
}
