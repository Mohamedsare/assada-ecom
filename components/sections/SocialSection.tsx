"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getWhatsAppUrl } from "@/lib/utils";
import { useSocialLinks } from "@/stores/config";

const CATEGORIES = [
  { emoji: "🌸", image: "/categories/parfums.jpeg",       label: "Parfums",          slug: "parfums"      },
  { emoji: "💄", image: "/categories/maquillage.jpeg",    label: "Maquillage",       slug: "maquillage"   },
  { emoji: "✨", image: "/categories/soins-visage.jpeg",  label: "Soins du visage",  slug: "soins-visage" },
  { emoji: "🧴", image: "/categories/soins-corps.jpeg",   label: "Soins du corps",   slug: "soins-corps"  },
  { emoji: "💆", image: "/categories/soins-cheveux.jpeg", label: "Soins des cheveux",slug: "soins-cheveux"},
  { emoji: "🧼", image: "/categories/hygiene.jpeg",       label: "Hygiène",          slug: "hygiene"      },
  { emoji: "💅", image: "/categories/accessoires.jpeg",   label: "Accessoires",      slug: "accessoires"  },
  { emoji: "🎁", image: "/categories/cadeaux.jpeg",       label: "Cadeaux",          slug: "cadeaux"      },
];

function CategoryCard({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  const [imgError, setImgError] = useState(false);
  const showImage = cat.image && !imgError;

  return (
    <Link
      href={`/boutique?categorie=${cat.slug}`}
      className="group relative rounded-2xl aspect-square overflow-hidden bg-gray-100 hover:scale-105 transition-transform"
    >
      {showImage ? (
        <Image
          src={cat.image}
          alt={cat.label}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-4xl">{cat.emoji}</span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
      <span className="absolute bottom-2 left-0 right-0 px-1 text-[11px] font-semibold text-white text-center leading-tight">
        {cat.label}
      </span>
    </Link>
  );
}

const SOCIALS = [
  {
    label: "TikTok",
    key: "tiktok",
    bg: "bg-[#010101] hover:bg-black",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    key: "facebook",
    bg: "bg-[#1877F2] hover:bg-[#1565c0]",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    key: "whatsapp",
    bg: "bg-whatsapp hover:bg-whatsapp-dark",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
];

export default function SocialSection() {
  // Liens réseaux sociaux pilotés par les Paramètres admin (WhatsApp garde son lien direct).
  const social = useSocialLinks();
  const socials = SOCIALS.map((s) => ({
    ...s,
    href: s.key === "whatsapp"
      ? getWhatsAppUrl("Bonjour RYTA, je suis intéressé par vos produits.")
      : social[s.key as "facebook" | "tiktok"],
  }));
  return (
    <section className="py-10 px-4 bg-gray-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-bold text-green uppercase tracking-widest mb-1">Réseaux sociaux</p>
          <h2 className="text-xl md:text-2xl font-bold text-[#0A2A52]">
            Suivez <span className="text-green">RYTA</span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Rejoignez notre communauté et ne ratez aucune nouveauté
          </p>
        </div>

        {/* Galerie catégories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} />
          ))}
        </div>

        {/* Boutons sociaux */}
        <div className="flex flex-wrap justify-center gap-3">
          {socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.bg} text-white flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors`}
            >
              {s.icon}
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
