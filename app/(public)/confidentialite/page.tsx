import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité — RYTA",
  description:
    "Politique de protection des données personnelles d’RYTA, conforme à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel (CNDP).",
  alternates: { canonical: "/confidentialite" },
  openGraph: { title: "Politique de confidentialité — RYTA", type: "website", locale: "fr_MA" },
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      subtitle="RYTA s’engage à protéger vos données personnelles, conformément à la loi marocaine n° 09-08."
      updatedAt="Janvier 2026"
    >
      <h2>1. Préambule</h2>
      <p>
        La présente politique décrit la manière dont <strong>RYTA</strong> collecte, utilise et protège
        les données à caractère personnel de ses clients et visiteurs. Elle est établie conformément à la{" "}
        <strong>loi n° 09-08</strong> relative à la protection des personnes physiques à l’égard du
        traitement des données à caractère personnel, et aux directives de la{" "}
        <strong>Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP)</strong>.
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est <strong>RYTA</strong>, dont la boutique est située
        Galerie Derb Ghalef, Boulevard Abdelmoumen, Kissariat Zemmouri, 20102 Derb Ghalef, Casablanca, Maroc.
        Contact : <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> — <a href={`tel:${SITE_PHONE}`}>{SITE_PHONE}</a>.
      </p>

      <h2>3. Données collectées</h2>
      <p>Dans le cadre de nos services, nous sommes susceptibles de collecter les données suivantes :</p>
      <ul>
        <li><strong>Données d’identification et de contact :</strong> nom, prénom, numéro de téléphone, adresse email.</li>
        <li><strong>Données de livraison :</strong> ville, quartier, adresse détaillée, repère.</li>
        <li><strong>Données de commande :</strong> produits commandés, montants, historique des commandes.</li>
        <li><strong>Données techniques :</strong> données de navigation et cookies (voir section dédiée).</li>
      </ul>

      <h2>4. Finalités du traitement</h2>
      <p>Vos données sont traitées pour les finalités suivantes :</p>
      <ul>
        <li>le traitement, la confirmation, la préparation et la livraison de vos commandes ;</li>
        <li>la gestion de la relation client et du service après-vente ;</li>
        <li>la gestion de votre compte client (si vous en créez un) ;</li>
        <li>l’envoi d’informations commerciales et d’offres, sous réserve de votre consentement ;</li>
        <li>l’amélioration de nos services et de votre expérience d’achat.</li>
      </ul>

      <h2>5. Base légale</h2>
      <p>
        Le traitement de vos données repose sur l’exécution du contrat de vente, sur votre consentement
        (notamment pour les communications marketing) et sur le respect de nos obligations légales.
      </p>

      <h2>6. Destinataires des données</h2>
      <p>
        Vos données sont destinées aux services internes d’RYTA habilités et, le cas échéant, à nos
        prestataires de livraison, strictement pour les besoins de l’exécution de votre commande. RYTA
        ne vend ni ne loue vos données personnelles à des tiers.
      </p>

      <h2>7. Durée de conservation</h2>
      <p>
        Vos données sont conservées pour la durée nécessaire aux finalités pour lesquelles elles ont été
        collectées, augmentée des durées de conservation imposées par la réglementation en vigueur
        (notamment comptable et fiscale), puis supprimées ou anonymisées.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        RYTA met en œuvre les mesures techniques et organisationnelles appropriées afin de protéger vos
        données contre la perte, l’accès non autorisé, la divulgation ou l’altération.
      </p>

      <h2>9. Vos droits</h2>
      <p>
        Conformément à la loi n° 09-08, vous disposez d’un droit d’<strong>accès</strong>, de{" "}
        <strong>rectification</strong>, d’<strong>opposition</strong> et de <strong>suppression</strong>{" "}
        de vos données personnelles. Vous pouvez exercer ces droits à tout moment en nous contactant à{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>. Vous disposez également du droit d’introduire une
        réclamation auprès de la <strong>CNDP</strong> (<a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">www.cndp.ma</a>).
      </p>

      <h2>10. Cookies</h2>
      <p>
        Le site peut utiliser des cookies techniques nécessaires à son bon fonctionnement (par exemple, la
        mémorisation du contenu de votre panier) ainsi que, le cas échéant, des cookies de mesure d’audience.
        Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels ; certaines
        fonctionnalités du site pourraient alors être limitées.
      </p>

      <h2>11. Modifications</h2>
      <p>
        RYTA se réserve le droit de modifier la présente politique afin de l’adapter aux évolutions
        légales ou de ses services. La version applicable est celle en vigueur au moment de votre visite.
      </p>

      <h2>12. Contact</h2>
      <p>
        Pour toute question relative à la protection de vos données, contactez-nous à{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> ou via la{" "}
        <Link href="/contact">page Contact</Link>.
      </p>
    </LegalPage>
  );
}
