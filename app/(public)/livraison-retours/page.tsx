import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Livraison & Retours — RYTA Casablanca",
  description:
    "Modalités de livraison et de retour RYTA : délais, frais, zones desservies partout au Maroc, paiement à la livraison et droit de rétractation de 7 jours conforme à la loi marocaine 31-08.",
  keywords: ["livraison cosmétique Casablanca", "retours RYTA", "paiement à la livraison Casablanca"],
  alternates: { canonical: "/livraison-retours" },
  openGraph: { title: "Livraison & Retours — RYTA", type: "website", locale: "fr_MA" },
};

export default function LivraisonRetoursPage() {
  return (
    <LegalPage
      title="Livraison & Retours"
      subtitle="Tout ce qu’il faut savoir sur la livraison de vos commandes et vos possibilités de retour."
      updatedAt="Janvier 2026"
    >
      <h2>1. Zones de livraison</h2>
      <p>
        RYTA livre <strong>partout au Maroc</strong> : Casablanca, Rabat, Marrakech, Tanger, Fès,
        Meknès, Agadir, Oujda, Kénitra, Tétouan et toutes les autres villes du Royaume. À Casablanca,
        nous desservons tous les quartiers — Derb Ghalef, Maârif, Boulevard Abdelmoumen, Gauthier,
        Anfa, Ain Diab, Sidi Maarouf, Hay Hassani et bien d’autres.
      </p>

      <h2>2. Délais de livraison</h2>
      <p>
        Les commandes sont préparées et expédiées dans les meilleurs délais. La livraison s’effectue{" "}
        <strong>partout au Maroc en 24 à 72 heures ouvrées</strong> après confirmation de la
        commande par téléphone. Un membre de notre équipe vous appelle pour confirmer votre commande
        avant expédition.
      </p>

      <h2>3. Frais de livraison</h2>
      <p>
        Les frais de livraison sont affichés clairement dans votre panier avant paiement. La{" "}
        <strong>livraison est gratuite à partir de 500 DH d’achat</strong>, partout au Maroc.
      </p>

      <h2>4. Paiement à la livraison</h2>
      <p>
        Le <strong>paiement à la livraison en espèces</strong> est actuellement notre mode de paiement.
        Vous réglez le montant total (produits + frais de livraison) directement au livreur, à la
        réception de votre colis, en toute sécurité.
      </p>

      <h2>5. Réception de la commande</h2>
      <p>
        À la réception, nous vous invitons à vérifier l’état de votre colis en présence du livreur.
        En cas de colis endommagé ou d’article manquant, signalez-le immédiatement et contactez-nous
        dans les plus brefs délais.
      </p>

      <h2>6. Droit de rétractation et retours</h2>
      <p>
        Conformément à la <strong>loi n° 31-08 édictant des mesures de protection du consommateur</strong>,
        vous disposez d’un délai de <strong>sept (7) jours</strong> à compter de la réception de votre
        commande pour exercer votre droit de rétractation, sans avoir à justifier de motif.
      </p>
      <h3>Conditions de retour</h3>
      <ul>
        <li>Le produit doit être <strong>neuf, non utilisé, non ouvert</strong> et dans son emballage d’origine intact.</li>
        <li>Pour des raisons d’hygiène et de sécurité, les produits cosmétiques descellés, ouverts ou entamés (parfums testés, crèmes ouvertes, maquillage utilisé, etc.) <strong>ne peuvent pas être repris</strong>.</li>
        <li>Le retour doit être accompagné de la preuve d’achat (facture ou numéro de commande).</li>
      </ul>
      <h3>Procédure</h3>
      <ol>
        <li>Contactez-nous à <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> ou au <a href={`tel:${SITE_PHONE}`}>{SITE_PHONE}</a> en indiquant votre numéro de commande.</li>
        <li>Nous vous communiquons les modalités de retour ou d’échange.</li>
        <li>Après réception et vérification du produit retourné, nous procédons à l’échange ou au remboursement du montant des articles éligibles.</li>
      </ol>

      <h2>7. Produits défectueux</h2>
      <p>
        Si un produit s’avère défectueux ou non conforme à votre commande, contactez-nous rapidement :
        nous procéderons à son remplacement ou à son remboursement, sans frais supplémentaires de votre part.
      </p>

      <h2>8. Besoin d’aide ?</h2>
      <p>
        Pour toute question relative à une livraison ou à un retour, notre service client est disponible
        via la <Link href="/contact">page Contact</Link>, par email ou par WhatsApp.
      </p>
    </LegalPage>
  );
}
