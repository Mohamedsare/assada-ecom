"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { Product } from "@/types";
import MiniProductCard from "./MiniProductCard";

export interface SubcatItem {
  name: string;
  slug: string;
  image?: string;
  emoji?: string;
  products: Product[];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Sélecteur de sous-catégories façon apia : boutons ronds + curseur glissant,
 * puis carrousel des produits de la sous-catégorie sélectionnée.
 * Réutilisé par « Nos Univers » pour chaque axe.
 */
export default function SubcatShowcase({ cats }: { cats: SubcatItem[] }) {
  // `active === null` → aucune sous-catégorie choisie : on n'affiche que les cercles.
  const [active, setActive] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null); // position continue 0..1 pendant le glissement
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const steps = Math.max(1, cats.length - 1);
  const current = active !== null ? cats[Math.min(active, cats.length - 1)] : null;
  // Position du curseur : suit le doigt pendant le glissement, sinon calée sur la sous-catégorie active (0 si aucune).
  const progress = drag !== null ? drag : active !== null ? active / steps : 0;

  // Glisser / cliquer sur le rail → sélectionne la sous-catégorie la plus proche.
  const updateFromClientX = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = clamp01((clientX - rect.left) / rect.width);
      setDrag(ratio);
      setActive(Math.round(ratio * steps));
    },
    [steps],
  );

  const onBarDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    updateFromClientX(e.clientX);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (draggingRef.current) updateFromClientX(e.clientX);
    };
    const up = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        setDrag(null); // relâche : le curseur se cale proprement sur la sous-catégorie choisie
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [updateFromClientX]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setActive((a) => Math.max(0, (a ?? 0) - 1)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setActive((a) => Math.min(cats.length - 1, (a ?? -1) + 1)); }
  };

  if (cats.length === 0) return null;

  return (
    <div>
      {/* Boutons ronds — rangée unique scrollable horizontalement */}
      <div className="flex items-start flex-nowrap gap-6 sm:gap-10 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {cats.map((c, i) => (
          <button key={c.slug} onClick={() => setActive(i)} className="shrink-0 flex flex-col items-center gap-3 group">
            <span
              className={`relative w-28 h-28 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden flex items-center justify-center bg-white transition-all ${
                i === active ? "ring-2 ring-[#B8925A] ring-offset-2 scale-105" : "ring-1 ring-gray-200 group-hover:ring-gray-300"
              }`}
            >
              {c.image ? (
                <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 176px, (min-width: 640px) 160px, 112px" className="object-cover" />
              ) : (
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#B8925A]/55" strokeWidth={1.4} />
              )}
            </span>
            <span className={`text-base sm:text-xl lg:text-2xl ${i === active ? "text-[#B8925A] font-semibold" : "text-text-secondary group-hover:text-[#020B27]"}`}>
              {c.name}
            </span>
          </button>
        ))}
      </div>

      {/* Rail à curseur : on le glisse pour passer d'une sous-catégorie à l'autre */}
      <div
        ref={barRef}
        onPointerDown={onBarDown}
        onKeyDown={onKeyDown}
        tabIndex={0}
        className="group relative h-6 max-w-xl mx-auto mb-8 flex items-center cursor-pointer touch-none select-none outline-none"
        role="slider"
        aria-label="Choisir une sous-catégorie"
        aria-valuemin={0}
        aria-valuemax={cats.length - 1}
        aria-valuenow={active ?? 0}
        aria-valuetext={current?.name}
      >
        {/* piste grise */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 rounded-full" />
        {/* portion remplie (dégradé doré) à gauche du curseur — visible une fois une sous-catégorie choisie */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-linear-to-r from-[#D8B778] to-[#9E7A45] ${
            drag === null ? "transition-[width] duration-300" : ""
          }`}
          style={{ width: `${(active !== null || drag !== null ? progress : 0) * 100}%` }}
        />
        {/* curseur (point) — n'apparaît qu'après sélection */}
        {(active !== null || drag !== null) && (
          <span
            className={`absolute top-1/2 w-3.5 h-3.5 rounded-full bg-green ring-4 ring-[#B8925A]/25 shadow
                       -translate-y-1/2 -translate-x-1/2 group-hover:scale-110 group-active:scale-95
                       cursor-grab active:cursor-grabbing ${drag === null ? "transition-[left] duration-300" : ""}`}
            style={{ left: `${progress * 100}%` }}
          />
        )}
      </div>

      {/* Produits de la sous-catégorie sélectionnée — invite, ou état vide */}
      {current === null ? (
        <p className="text-center text-sm text-text-secondary py-6">
          Choisissez une sous-catégorie ci-dessus pour découvrir ses produits.
        </p>
      ) : current.products.length > 0 ? (
        <div className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
          {current.products.map((p) => (
            <div key={p.id} className="shrink-0 w-[46%] sm:w-[45%] lg:w-[23%] snap-start">
              <MiniProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-light rounded-2xl">
          <p className="text-3xl mb-2">✨</p>
          <p className="font-semibold text-[#020B27]">Bientôt disponible</p>
          <p className="text-sm text-text-secondary mt-1">
            De nouveaux produits arrivent très vite dans « {current.name} ».
          </p>
        </div>
      )}
    </div>
  );
}
