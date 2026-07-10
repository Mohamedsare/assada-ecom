"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePageImage } from "@/stores/config";
import Footer from "@/components/layout/Footer";

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

  return (
    <>
      {/* ── Galerie Instagram ── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_2.2fr] gap-8 items-center">
          {/* Texte */}
          <div>
            <p className="text-xs font-bold text-[#B8925A] uppercase tracking-widest mb-2">Suivez-nous</p>
            <p className="text-[#020B27] text-2xl font-extrabold mb-1">@ryta</p>
            <p className="text-gray-400 text-sm mb-5">Découvrez nos produits en images</p>
            <Link
              href="https://www.instagram.com/ryta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green hover:bg-[#9E7A45] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 2.76a7.08 7.08 0 100 14.16 7.08 7.08 0 000-14.16zm0 11.68a4.6 4.6 0 110-9.2 4.6 4.6 0 010 9.2zm7.2-11.85a1.27 1.27 0 11-2.55 0 1.27 1.27 0 012.55 0z" />
              </svg>
              Nous suivre sur Instagram
            </Link>
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
