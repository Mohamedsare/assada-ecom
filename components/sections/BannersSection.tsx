"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Banner = {
  href: string;
  badge: string;
  title: React.ReactNode;
  cta: string;
  /** image d'arrière-plan finale */
  bgImage: string;
  /** image de secours tant que la finale n'est pas fournie */
  fallback: string;
  base: string;        // couleur de fond sous l'image
  overlay: string;     // dégradé pour lisibilité
  button: string;      // style du bouton
  badgeStyle: string;  // style du badge
};

const BANNERS: Banner[] = [
  {
    href: "/promotions",
    badge: "Offre spéciale",
    title: (
      <>
        Jusqu&apos;à <span className="text-green-light">-30%</span>
        <br />
        sur une sélection
        <br />
        d&apos;articles
      </>
    ),
    cta: "J'en profite maintenant",
    bgImage: "/banners/banner4-accueil.png",
    fallback: "/banners/banner2-accueil.png",
    base: "bg-night",
    overlay: "bg-linear-to-r from-night via-night/70 to-transparent",
    button: "bg-green hover:bg-[#15803D] text-white",
    badgeStyle: "bg-green/20 text-green-light border border-green-light/40",
  },
  {
    href: "/nouveautes",
    badge: "Nouveautés",
    title: (
      <>
        Découvrez nos
        <br />
        dernières
        <br />
        nouveautés
      </>
    ),
    cta: "Voir les nouveautés",
    bgImage: "/banners/banner3-accuiel.png",
    fallback: "/banners/banner2-accueil.png",
    base: "bg-night-2",
    overlay: "bg-linear-to-r from-night-2 via-night-2/70 to-transparent",
    button: "bg-[#1d4ed8] hover:bg-[#1e40af] text-white",
    badgeStyle: "bg-green/20 text-green-light border border-green-light/40",
  },
];

function BannerCard({ banner }: { banner: Banner }) {
  const [bgError, setBgError] = useState(false);
  const src = bgError ? banner.fallback : banner.bgImage;

  return (
    <Link
      href={banner.href}
      className={`group relative overflow-hidden rounded-2xl ${banner.base} min-h-44 md:min-h-52 flex items-center`}
    >
      {/* Image de fond */}
      <Image
        src={src}
        alt={banner.badge}
        fill
        className="object-cover object-right group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={() => setBgError(true)}
      />
      {/* Dégradé */}
      <div className={`absolute inset-0 ${banner.overlay}`} />

      {/* Contenu */}
      <div className="relative z-10 p-6 md:p-8 max-w-[70%]">
        <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${banner.badgeStyle}`}>
          {banner.badge}
        </span>
        <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight mb-5">
          {banner.title}
        </h3>
        <span className={`inline-flex items-center gap-1 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors ${banner.button}`}>
          {banner.cta}
        </span>
      </div>
    </Link>
  );
}

export default function BannersSection() {
  return (
    <section className="py-6 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-4">
        {BANNERS.map((banner) => (
          <BannerCard key={banner.href} banner={banner} />
        ))}
      </div>
    </section>
  );
}
