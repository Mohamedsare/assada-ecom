import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente et d’Utilisation — Assada",
  description:
    "Conditions Générales de Vente et d’Utilisation d’Assada, conformes au droit marocain (loi 31-08 sur la protection du consommateur, loi 53-05 sur l’échange électronique de données et le Dahir des Obligations et Contrats).",
  alternates: { canonical: "/conditions" },
  robots: { index: true, follow: true },
  openGraph: { title: "Conditions Générales — Assada", type: "website", locale: "fr_MA" },
};

export default function ConditionsPage() {
  return (
    <LegalPage
      title="Conditions Générales de Vente et d’Utilisation"
      subtitle="Les présentes conditions régissent l’utilisation du site Assada et les ventes qui y sont conclues. Elles sont soumises au droit marocain."
      updatedAt="Janvier 2026"
    >
      <h2>1. Objet et champ d’application</h2>
      <p>
        Les présentes Conditions Générales de Vente et d’Utilisation (ci-après les « CGVU ») ont pour
        objet de définir les modalités de vente des produits proposés par <strong>Assada</strong> sur son
        site, ainsi que les conditions d’utilisation de ce dernier. Toute commande implique l’acceptation
        pleine et entière des présentes CGVU par le client. Elles sont établies conformément au droit
        marocain, notamment la <strong>loi n° 31-08</strong> édictant des mesures de protection du
        consommateur, la <strong>loi n° 53-05</strong> relative à l’échange électronique de données
        juridiques et le <strong>Dahir des Obligations et Contrats (D.O.C.)</strong>.
      </p>

      <h2>2. Identification du vendeur</h2>
      <ul>
        <li><strong>Dénomination :</strong> Assada — Cosmétiques & Parfums</li>
        <li><strong>Adresse :</strong> Galerie Derb Ghalef, Boulevard Abdelmoumen, Kissariat Zemmouri, 20102 Derb Ghalef, Casablanca, Maroc</li>
        <li><strong>Email :</strong> <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a></li>
        <li><strong>Téléphone / WhatsApp :</strong> <a href={`tel:${SITE_PHONE}`}>{SITE_PHONE}</a></li>
      </ul>

      <h2>3. Produits</h2>
      <p>
        Les produits proposés (cosmétiques, parfums, soins, maquillage, hygiène, accessoires, coffrets)
        sont décrits et présentés avec la plus grande exactitude possible. Les photographies et
        descriptions sont fournies à titre indicatif et n’engagent pas le vendeur en cas de légères
        différences. Les produits sont proposés dans la limite des stocks disponibles.
      </p>

      <h2>4. Prix</h2>
      <p>
        Les prix sont indiqués en <strong>dirhams marocains (DH / MAD)</strong>, toutes taxes comprises (TTC).
        Assada se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés sur la
        base des tarifs en vigueur au moment de la validation de la commande. Les éventuels frais de
        livraison sont indiqués séparément avant la validation de la commande.
      </p>

      <h2>5. Commande</h2>
      <p>
        Le client peut passer commande sur le site sans obligation de créer un compte, ou via WhatsApp.
        Toute commande fait l’objet d’une confirmation, généralement par téléphone, avant préparation et
        expédition. Assada se réserve le droit d’annuler ou de refuser toute commande émanant d’un client
        avec lequel existerait un litige, ou en cas de commande manifestement frauduleuse.
      </p>

      <h2>6. Paiement</h2>
      <p>
        Le mode de paiement actuellement proposé est le <strong>paiement à la livraison en espèces</strong> :
        le règlement s’effectue au moment de la réception de la commande, directement auprès du livreur.
      </p>

      <h2>7. Livraison</h2>
      <p>
        Les modalités, délais et frais de livraison sont détaillés dans notre page{" "}
        <Link href="/livraison-retours">Livraison &amp; Retours</Link>. Les délais indiqués sont donnés à
        titre indicatif ; un retard de livraison ne peut donner lieu à annulation de la commande ni au
        versement de dommages et intérêts, sauf disposition légale impérative contraire.
      </p>

      <h2>8. Droit de rétractation</h2>
      <p>
        Conformément à la <strong>loi n° 31-08</strong>, le consommateur dispose d’un délai de{" "}
        <strong>sept (7) jours</strong> à compter de la réception du produit pour exercer son droit de
        rétractation. Les conditions et exclusions (notamment pour les produits cosmétiques descellés,
        pour des raisons d’hygiène) sont précisées dans notre page{" "}
        <Link href="/livraison-retours">Livraison &amp; Retours</Link>.
      </p>

      <h2>9. Garanties</h2>
      <p>
        Les produits bénéficient des garanties légales prévues par le Dahir des Obligations et Contrats et
        par la loi n° 31-08, notamment en cas de vice caché ou de non-conformité du produit livré à la
        commande.
      </p>

      <h2>10. Responsabilité</h2>
      <p>
        Les produits sont destinés à un usage cosmétique normal. Le client est tenu de lire les précautions
        d’emploi et la composition figurant sur l’emballage, en particulier en cas d’allergie connue.
        La responsabilité d’Assada ne saurait être engagée en cas de mauvaise utilisation d’un produit.
        Assada ne saurait être tenue responsable des dommages résultant d’un cas de force majeure ou d’une
        interruption temporaire du site.
      </p>

      <h2>11. Propriété intellectuelle</h2>
      <p>
        L’ensemble des éléments du site (marque, logo, textes, visuels, mise en page) est protégé par les
        lois marocaines et internationales relatives à la propriété intellectuelle. Toute reproduction,
        représentation ou exploitation, totale ou partielle, sans autorisation écrite préalable d’Assada,
        est interdite.
      </p>

      <h2>12. Données personnelles</h2>
      <p>
        Le traitement des données personnelles des clients est effectué conformément à la{" "}
        <strong>loi n° 09-08</strong>. Pour en savoir plus, consultez notre{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2>13. Droit applicable et juridiction compétente</h2>
      <p>
        Les présentes CGVU sont régies par le <strong>droit marocain</strong>. En cas de litige, et à
        défaut de résolution amiable, compétence expresse est attribuée aux <strong>tribunaux
        compétents de Casablanca</strong>, nonobstant pluralité de défendeurs ou appel en garantie.
      </p>

      <h2>14. Contact</h2>
      <p>
        Pour toute question relative aux présentes conditions, contactez-nous à{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> ou via la{" "}
        <Link href="/contact">page Contact</Link>.
      </p>
    </LegalPage>
  );
}
