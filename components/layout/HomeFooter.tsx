"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePageImage, useSocialLinks } from "@/stores/config";
import { getWhatsAppUrl } from "@/lib/utils";
import Footer from "@/components/layout/Footer";

/* ── Réseaux sociaux (icônes réelles, vraies couleurs de marque) ──
   `key` = réseau piloté par les Paramètres admin ; le href est résolu à l'affichage. */
const SOCIALS = [
  {
    label: "Facebook",
    key: "facebook",
    className: "bg-[#1877F2] hover:brightness-110",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    key: "tiktok",
    className: "bg-black hover:brightness-125",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    key: "instagram",
    className:
      "bg-[linear-gradient(45deg,#f09433,#e6683c_25%,#dc2743_50%,#cc2366_75%,#bc1888)] hover:brightness-110",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 2.76a7.08 7.08 0 100 14.16 7.08 7.08 0 000-14.16zm0 11.68a4.6 4.6 0 110-9.2 4.6 4.6 0 010 9.2zm7.2-11.85a1.27 1.27 0 11-2.55 0 1.27 1.27 0 012.55 0z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    key: "whatsapp",
    className: "bg-[#25D366] hover:brightness-110",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
];

/* ── Galerie Instagram (images éditables via « Gestion des pages ») ── */
type GalleryItem = { image: string; emoji: string; bg: string };
const GALLERY_META = [
  { emoji: "🌸", bg: "bg-pink-100" },
  { emoji: "✨", bg: "bg-rose-100" },
  { emoji: "💄", bg: "bg-fuchsia-100" },
  { emoji: "💆", bg: "bg-amber-100" },
  { emoji: "🎁", bg: "bg-gray-100" },
];

function GalleryImg({ item, alt }: { item: GalleryItem; alt: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className={`relative aspect-square rounded-xl overflow-hidden ${item.bg} group cursor-pointer`}>
      {!err ? (
        <Image
          src={item.image}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 40vw, 16vw"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">{item.emoji}</div>
      )}
    </div>
  );
}

export default function HomeFooter() {
  // Images de la galerie éditables depuis « Gestion des pages » (repli emoji sinon).
  const galleryImgs = [
    usePageImage("gallery_1"), usePageImage("gallery_2"), usePageImage("gallery_3"),
    usePageImage("gallery_4"), usePageImage("gallery_5"),
  ];
  const gallery: GalleryItem[] = GALLERY_META.map((m, i) => ({ ...m, image: galleryImgs[i] }));

  // Liens réseaux sociaux pilotés par les Paramètres admin (WhatsApp garde son lien direct).
  const social = useSocialLinks();
  const socials = SOCIALS.map((s) => ({
    ...s,
    href: s.key === "whatsapp"
      ? getWhatsAppUrl("Bonjour RYTA, je suis intéressé par vos produits.")
      : social[s.key as "facebook" | "tiktok" | "instagram"],
  }));

  return (
    <>
      {/* ── Galerie Instagram ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_2.2fr] gap-8 items-center">
          {/* Texte */}
          <div>
            <p className="text-xs font-bold text-[#2F9E44] uppercase tracking-widest mb-2">Suivez-nous</p>
            <p className="text-[#0A2A52] text-2xl font-extrabold mb-1">@ryta</p>
            <p className="text-gray-400 text-sm mb-5">Découvrez nos produits en images</p>
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={`${s.className} flex items-center justify-center w-11 h-11 rounded-full text-white shadow-sm transition-all hover:-translate-y-0.5`}
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {gallery.map((item, i) => (
              <GalleryImg key={i} item={item} alt={`Publication ${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer principal (façon apia, couleurs RYTA) ── */}
      <Footer />
    </>
  );
}
