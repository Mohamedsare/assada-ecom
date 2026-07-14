"use client";

import { useState } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import SubcatShowcase, { type SubcatItem } from "./SubcatShowcase";

export interface Univers {
  name: string;
  slug: string;
  /** Sous-catégories de l'axe (cercles) — vide si l'axe n'a pas de sous-catégories. */
  subcats: SubcatItem[];
  /** Produits de l'axe (repli quand il n'y a pas de sous-catégories). */
  products: Product[];
}

/**
 * « Nos Univers » : onglets des 3 grands axes. Cliquer un axe affiche ses
 * sous-catégories en cercles (façon « Beauté & bien-être ») ; cliquer une
 * sous-catégorie affiche ses produits.
 */
export default function NosUnivers({ univers }: { univers: Univers[] }) {
  const [active, setActive] = useState(0);
  if (univers.length === 0) return null;
  const current = univers[Math.min(active, univers.length - 1)];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0A2A52] text-center mb-5">Nos Univers</h2>

        {/* Onglets des axes — une seule ligne, scroll horizontal si débordement (mobile) */}
        <div className="flex sm:justify-center gap-x-6 mb-8 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {univers.map((u, i) => (
            <button
              key={u.slug}
              onClick={() => setActive(i)}
              className={`relative shrink-0 whitespace-nowrap pb-3 text-base transition-colors ${
                i === active ? "text-[#0A2A52] font-semibold" : "text-text-secondary hover:text-[#0A2A52]"
              }`}
            >
              {u.name}
              {i === active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#2F9E44] rounded-full" />}
            </button>
          ))}
        </div>

        {/* Drill-down : sous-catégories en cercles → produits ; sinon grille de l'axe. */}
        {current.subcats.length > 0 ? (
          <SubcatShowcase key={current.slug} cats={current.subcats} />
        ) : current.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {current.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 bg-gray-light rounded-2xl">
            <p className="text-3xl mb-2">✨</p>
            <p className="font-semibold text-[#0A2A52]">Bientôt disponible</p>
            <p className="text-sm text-text-secondary mt-1">
              De nouveaux produits arrivent très vite dans l&apos;univers {current.name}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
