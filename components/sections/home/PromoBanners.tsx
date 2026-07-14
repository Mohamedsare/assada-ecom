"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
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
  const { href, imageKey, gradient } = banner;
  const dyn = usePageImage(imageKey);
  const [err, setErr] = useState(false);
  const src = err ? PAGE_IMAGE_DEFAULTS[imageKey] : dyn;

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-2xl bg-linear-to-br ${gradient} min-h-28 sm:min-h-44 shadow-sm transition-transform duration-300 hover:-translate-y-0.5`}
    >
      {/* Image de fond gérée en admin — laissée entièrement visible */}
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
    </Link>
  );
}

export default function PromoBanners() {
  return (
    <section className="py-10 px-4 bg-gray-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold uppercase tracking-wide text-[#0A2A52]">
            Nos exceptions
          </h2>
          <span className="mt-2 inline-block h-1 w-12 rounded-full bg-[#2F9E44]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BANNERS.map((banner) => (
            <Banner key={banner.href} banner={banner} />
          ))}
        </div>
      </div>
    </section>
  );
}
