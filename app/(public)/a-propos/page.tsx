import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, MessageCircle, Store, Sparkles, HeartHandshake } from "lucide-react";
import LegalPage from "@/components/legal/LegalPage";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "À propos — RYTA, boutique cosmétique à Casablanca",
  description:
    "Découvrez RYTA : produits de beauté, compléments alimentaires et produits du terroir marocain. Boutique physique à Derb Ghalef, Casablanca. Produits authentiques, meilleurs prix, livraison partout au Maroc et paiement à la livraison.",
  keywords: ["à propos RYTA", "boutique cosmétique Casablanca", "parfums Derb Ghalef"],
  alternates: { canonical: "/a-propos" },
  openGraph: { title: "À propos — RYTA", type: "website", locale: "fr_MA" },
};

const VALUES = [
  { icon: Sparkles, title: "Produits authentiques", desc: "Des cosmétiques, parfums et soins 100 % originaux, sélectionnés avec soin." },
  { icon: Truck, title: "Livraison rapide", desc: "Partout au Maroc en 24 à 72h, gratuite à partir de 300 DH." },
  { icon: ShieldCheck, title: "Paiement à la livraison", desc: "Payez en espèces à la réception, en toute confiance." },
  { icon: MessageCircle, title: "Support WhatsApp", desc: "Une équipe à votre écoute 7j/7 pour vous conseiller." },
];

export default function AProposPage() {
  return (
    <LegalPage
      title="À propos d’RYTA"
      subtitle="Beauté, compléments alimentaires et produits du terroir marocain à Casablanca — qualité, confiance et satisfaction garanties."
      heroImage="/banners/banner-a-propos.png"
    >
      <h2>Qui sommes-nous ?</h2>
      <p>
        <strong>RYTA, votre partenaire beauté, bien-être et produits du terroir.</strong>
      </p>
      <p>
        Située au <strong>Boulevard Abdelmoumen à Casablanca</strong>, RYTA sélectionne avec exigence des
        produits de qualité pour répondre à tous vos besoins. Notre univers s’articule autour de trois
        grandes catégories :
      </p>
      <ul>
        <li>
          <strong>Beauté</strong> : parfums, maquillage, soins du visage, du corps et des cheveux, produits
          d’hygiène, accessoires et coffrets cadeaux.
        </li>
        <li>
          <strong>Compléments alimentaires</strong> : vitalité, immunité (acérola, ginseng, spiruline),
          minceur, détox et digestif (thés, infusions et cafés), antistress (chocolat noir, magnésium et
          infusions), antidouleur musculaire (patchs chauffants…).
        </li>
        <li>
          <strong>Produits du terroir</strong> : huile d’argan, safran, beurre de karité, moringa, cacao,
          vanille, eaux florales, miel, propolis, pollen, matcha… et autres trésors authentiques.
        </li>
      </ul>
      <p>
        Notre engagement est de vous offrir une sélection de produits <strong>100 % authentiques</strong>,
        soigneusement choisis parmi les meilleures marques, au meilleur rapport qualité-prix.
      </p>
      <p>
        Chez RYTA, nous mettons la <strong>satisfaction de nos clients</strong> au cœur de nos priorités
        grâce à :
      </p>
      <ul>
        <li>Des produits fiables.</li>
        <li>Des prix compétitifs toute l’année.</li>
        <li>Un accompagnement personnalisé et des conseils de confiance.</li>
        <li>Une expérience d’achat simple, rapide et sécurisée, en boutique comme en ligne.</li>
        <li>Une livraison rapide partout au Maroc.</li>
      </ul>
      <p>
        RYTA, c’est bien plus qu’une boutique : c’est une <strong>référence</strong> pour celles et ceux qui
        recherchent qualité, authenticité et excellence, sans compromis sur le prix.
      </p>

      <h2>Nos valeurs</h2>
      <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4">
              <div className="w-10 h-10 rounded-xl bg-[#2F9E44]/15 text-[#2F9E44] flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-[#0A2A52] text-sm">{v.title}</p>
                <p className="text-[#64748B] text-sm mt-0.5 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h2>Notre boutique</h2>
      <p>
        Retrouvez-nous en boutique : <strong>Galerie Derb Ghalef, Boulevard Abdelmoumen, Kissariat Zemmouri,
        Derb Ghalef, Casablanca</strong>. Notre équipe vous accueille pour vous conseiller et vous faire
        découvrir nos nouveautés et nos meilleures offres.
      </p>

      <h2>Nous contacter</h2>
      <p>
        Une question, un conseil, besoin d&apos;aide ? Écrivez-nous à{" "}
        <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>, appelez-nous au{" "}
        <a href={`tel:${SITE_PHONE}`}>{SITE_PHONE}</a>, ou passez par notre{" "}
        <Link href="/contact">page Contact</Link>.
      </p>

      <div className="flex flex-wrap gap-3 not-prose mt-6">
        <Link href="/boutique" className="inline-flex items-center gap-2 bg-[#2F9E44] btn-sweep hover:bg-[#237A34] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <Store size={16} /> Découvrir la boutique
        </Link>
        <Link href="/contact" className="inline-flex items-center gap-2 border border-gray-200 text-[#0A2A52] text-sm font-semibold px-5 py-2.5 rounded-xl hover:border-[#2F9E44] hover:text-[#2F9E44] transition-colors">
          <HeartHandshake size={16} /> Nous contacter
        </Link>
      </div>
    </LegalPage>
  );
}
