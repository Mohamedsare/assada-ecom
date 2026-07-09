"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

export interface Univers {
  name: string;
  slug: string;
  products: Product[];
}

/** « Nos Univers » façon apia : onglets de catégories + grille de 4 produits. */
export default function NosUnivers({ univers }: { univers: Univers[] }) {
  const [active, setActive] = useState(0);
  if (univers.length === 0) return null;
  const current = univers[Math.min(active, univers.length - 1)];

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#020B27] text-center mb-5">Nos Univers</h2>

        {/* Onglets — sur une seule ligne, scroll horizontal si débordement (mobile) */}
        <div className="flex sm:justify-center gap-x-6 mb-8 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {univers.map((u, i) => (
            <button
              key={u.slug}
              onClick={() => setActive(i)}
              className={`relative shrink-0 whitespace-nowrap pb-3 text-sm transition-colors ${
                i === active ? "text-[#020B27] font-semibold" : "text-text-secondary hover:text-[#020B27]"
              }`}
            >
              {u.name}
              {i === active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#B8925A] rounded-full" />}
            </button>
          ))}
        </div>

        {/* Grille produits ou état vide */}
        {current.products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {current.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`/boutique?categorie=${current.slug}`}
                className="inline-flex items-center gap-1.5 text-[#B8925A] font-semibold text-sm hover:underline"
              >
                Voir tout {current.name} <ChevronRight size={16} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-14 bg-gray-light rounded-2xl">
            <p className="text-3xl mb-2">✨</p>
            <p className="font-semibold text-[#020B27]">Bientôt disponible</p>
            <p className="text-sm text-text-secondary mt-1">
              De nouveaux produits arrivent très vite dans l&apos;univers {current.name}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
