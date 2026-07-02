import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, MessageCircle, Store, Sparkles, HeartHandshake } from "lucide-react";
import LegalPage from "@/components/legal/LegalPage";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "À propos — Assada, boutique cosmétique à Casablanca",
  description:
    "Découvrez Assada, votre boutique de cosmétiques, parfums et soins beauté à Derb Ghalef, Casablanca. Produits authentiques, meilleurs prix, livraison rapide et paiement à la livraison.",
  keywords: ["à propos Assada", "boutique cosmétique Casablanca", "parfums Derb Ghalef"],
  alternates: { canonical: "/a-propos" },
  openGraph: { title: "À propos — Assada", type: "website", locale: "fr_MA" },
};

const VALUES = [
  { icon: Sparkles, title: "Produits authentiques", desc: "Des cosmétiques, parfums et soins 100 % originaux, sélectionnés avec soin." },
  { icon: Truck, title: "Livraison rapide", desc: "Partout à Casablanca — Derb Ghalef, Maârif, Anfa et tous les quartiers." },
  { icon: ShieldCheck, title: "Paiement à la livraison", desc: "Payez en espèces à la réception, en toute confiance." },
  { icon: MessageCircle, title: "Support WhatsApp", desc: "Une équipe à votre écoute 7j/7 pour vous conseiller." },
];

export default function AProposPage() {
  return (
    <LegalPage
      title="À propos d’Assada"
      subtitle="Votre boutique de cosmétiques, parfums et soins beauté à Casablanca — qualité, confiance et satisfaction garanties."
      heroImage="/banners/banner-a-propos.png"
    >
      <h2>Qui sommes-nous ?</h2>
      <p>
        <strong>Assada</strong> est une boutique spécialisée dans la vente de produits cosmétiques,
        parfums, pommades, soins du visage, du corps et des cheveux, maquillage, produits d’hygiène,
        accessoires beauté et coffrets cadeaux. Installée au cœur de <strong>Derb Ghalef à Casablanca</strong>,
        nous proposons une sélection premium au meilleur prix, en boutique physique comme en ligne.
      </p>
      <p>
        Notre mission : rendre la beauté accessible à toutes et à tous, avec des produits authentiques,
        un conseil de proximité et une expérience d’achat simple, rapide et rassurante.
      </p>

      <h2>Nos valeurs</h2>
      <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4">
              <div className="w-10 h-10 rounded-xl bg-[#B8925A]/15 text-[#B8925A] flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-[#020B27] text-sm">{v.title}</p>
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
        <Link href="/boutique" className="inline-flex items-center gap-2 bg-[#B8925A] hover:bg-[#9E7A45] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          <Store size={16} /> Découvrir la boutique
        </Link>
        <Link href="/contact" className="inline-flex items-center gap-2 border border-gray-200 text-[#020B27] text-sm font-semibold px-5 py-2.5 rounded-xl hover:border-[#B8925A] hover:text-[#B8925A] transition-colors">
          <HeartHandshake size={16} /> Nous contacter
        </Link>
      </div>
    </LegalPage>
  );
}
