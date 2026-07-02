"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Cat = {
  name: string;
  slug: string;
  emoji: string;
  image?: string; // déposez les images dans /public/categories/ pour les afficher
  bg: string;
};

const CATEGORIES: Cat[] = [
  { name: "Parfums",         slug: "parfums",       emoji: "🌸", image: "/categories/parfums.jpeg",       bg: "bg-gray-100" },
  { name: "Maquillage",      slug: "maquillage",    emoji: "💄", image: "/categories/maquillage.jpeg",    bg: "bg-gray-100" },
  { name: "Soins du\nvisage", slug: "soins-visage",  emoji: "✨", image: "/categories/soins-visage.jpeg",  bg: "bg-gray-100" },
  { name: "Soins du\ncorps",  slug: "soins-corps",   emoji: "🧴", image: "/categories/soins-corps.jpeg",   bg: "bg-gray-100" },
  { name: "Soins des\ncheveux", slug: "soins-cheveux", emoji: "💆", image: "/categories/soins-cheveux.jpeg", bg: "bg-gray-100" },
  { name: "Hygiène",         slug: "hygiene",       emoji: "🧼", image: "/categories/hygiene.jpeg",       bg: "bg-gray-100" },
  { name: "Accessoires",     slug: "accessoires",   emoji: "💅", image: "/categories/accessoires.jpeg",   bg: "bg-gray-100" },
  { name: "Cadeaux",         slug: "cadeaux",       emoji: "🎁", image: "/categories/cadeaux.jpeg",       bg: "bg-gray-100" },
  { name: "Bien-être",       slug: "bien-etre",     emoji: "🌿", image: "/categories/bien-etre.jpeg",     bg: "bg-gray-100" },
];

function CategoryCircle({ cat }: { cat: Cat }) {
  const [imgError, setImgError] = useState(false);
  const showImage = cat.image && !imgError;

  return (
    <Link
      href={`/boutique?categorie=${cat.slug}`}
      className="shrink-0 flex flex-col items-center gap-3 group w-24 md:w-full"
    >
      <div
        className={`relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-full ${cat.bg} overflow-hidden flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg transition-all ring-1 ring-gray-200 group-hover:ring-green`}
      >
        {showImage ? (
          <Image
            src={cat.image!}
            alt={cat.name.replace("\n", " ")}
            fill
            className="object-cover"
            sizes="112px"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-4xl">{cat.emoji}</span>
        )}
      </div>
      <span className="text-xs md:text-sm font-medium text-[#020B27] text-center leading-tight whitespace-pre-line group-hover:text-green transition-colors">
        {cat.name}
      </span>
    </Link>
  );
}

export default function CategoriesSection() {
  return (
    <section className="py-12 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-green uppercase tracking-widest mb-2">
            Catégories
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#020B27]">
            Parcourez nos catégories
          </h2>
        </div>

        {/* Mobile : défilement automatique infini (marquee) */}
        <div className="md:hidden overflow-hidden">
          <div className="flex gap-5 w-max animate-marquee">
            {/* liste dupliquée pour une boucle infinie sans coupure */}
            {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
              <CategoryCircle key={`${cat.slug}-${i}`} cat={cat} />
            ))}
          </div>
        </div>

        {/* Desktop : grille statique */}
        <div className="hidden md:grid md:grid-cols-9 md:gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCircle key={cat.slug} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
