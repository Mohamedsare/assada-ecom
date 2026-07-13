"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { usePageImage } from "@/stores/config";
import { PAGE_IMAGE_DEFAULTS } from "@/lib/constants";

/**
 * Section « Offres » : deux bannières commerciales (coffrets & promotions).
 * Le fond de chaque carte est une image gérée en admin (« Gestion des pages » →
 * « Accueil — cartes Offres », clés `offer_coffrets` / `offer_promotions`),
 * recouverte d'un voile dégradé pour garder le texte lisible.
 */
const BANNERS = [
  {
    href: "/coffrets-cadeaux",
    imageKey: "offer_coffrets",
    title: "Coffrets & compositions à offrir sans hésiter",
    subtitle: "Des idées cadeaux prêtes à faire plaisir, toute l'année.",
    cta: "J'en profite",
    gradient: "from-[#2F9E44] to-[#237A34]",
    overlay: "from-[#2F9E44]/95 via-[#2F9E44]/75 to-[#237A34]/45",
  },
  {
    href: "/promotions",
    imageKey: "offer_promotions",
    title: "Nos meilleures promotions du moment",
    subtitle: "Jusqu'à -50 % sur une sélection de produits.",
    cta: "J'en profite",
    gradient: "from-[#0A2A52] to-[#061C38]",
    overlay: "from-[#0A2A52]/95 via-[#0A2A52]/75 to-[#061C38]/50",
  },
] as const;

function Banner({ banner }: { banner: (typeof BANNERS)[number] }) {
  const { href, imageKey, title, subtitle, cta, gradient, overlay } = banner;
  const dyn = usePageImage(imageKey);
  const [err, setErr] = useState(false);
  const src = err ? PAGE_IMAGE_DEFAULTS[imageKey] : dyn;

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${gradient} text-white p-6 sm:p-8 flex flex-col justify-between min-h-44 shadow-sm transition-transform duration-300 hover:-translate-y-0.5`}
    >
      {/* Image de fond gérée en admin */}
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setErr(true)}
        />
      )}
      {/* Voile dégradé de la couleur pour garder le texte lisible */}
      <div className={`absolute inset-0 bg-linear-to-r ${overlay}`} />

      <div className="relative z-10 max-w-[62%] sm:max-w-sm">
        <h3 className="text-lg sm:text-xl font-extrabold leading-snug">{title}</h3>
        <p className="text-white/80 text-sm mt-2">{subtitle}</p>
      </div>
      <span className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide">
        {cta}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function PromoBanners() {
  return (
    <section className="py-10 px-4 bg-gray-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2F9E44] mb-1">Offres</p>
          <h2 className="text-xl md:text-2xl font-bold text-[#0A2A52]">Nos offres à ne pas manquer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BANNERS.map((banner) => (
            <Banner key={banner.href} banner={banner} />
          ))}
        </div>

        <div className="mt-4 text-right">
          <Link
            href="/promotions"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F9E44] hover:underline"
          >
            Voir plus de promotions <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
