"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types";
import { useConfigStore } from "@/stores/config";
import MiniProductCard from "./MiniProductCard";

export interface BeautyCat {
  name: string;
  slug: string;
  image?: string;
  emoji?: string;
  products: Product[];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** « Beauté & bien-être » façon apia : boutons ronds + curseur glissant entre sous-catégories. */
export default function BeauteBienEtre({ cats }: { cats: BeautyCat[] }) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState<number | null>(null); // position continue 0..1 pendant le glissement
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Images des cercles gérées en admin (« Gestion des pages » → Bien-être), par position.
  const pageImages = useConfigStore((s) => s.images);
  // Priorité : image admin du cercle → image de la sous-catégorie → emoji.
  const circleImage = (i: number) => (pageImages[`bien_etre_${i + 1}`] || "").trim() || cats[i]?.image;

  const steps = Math.max(1, cats.length - 1);
  const current = cats[Math.min(active, cats.length - 1)];
  // Position du curseur : suit le doigt pendant le glissement, sinon calée sur la sous-catégorie active.
  const progress = drag !== null ? drag : active / steps;

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
    if (e.key === "ArrowLeft") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setActive((a) => Math.min(cats.length - 1, a + 1)); }
  };

  if (cats.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#020B27] text-center mb-8">Beauté &amp; bien-être</h2>

        {/* Boutons ronds — mobile : rangée unique scrollable ; desktop : centrés */}
        <div className="flex items-start flex-nowrap gap-6 sm:gap-10 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {cats.map((c, i) => {
            const img = circleImage(i);
            return (
            <button key={c.slug} onClick={() => setActive(i)} className="shrink-0 flex flex-col items-center gap-3 group">
              <span
                className={`relative w-28 h-28 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden flex items-center justify-center bg-white transition-all ${
                  i === active ? "ring-2 ring-[#B8925A] ring-offset-2 scale-105" : "ring-1 ring-gray-200 group-hover:ring-gray-300"
                }`}
              >
                {img ? (
                  <Image src={img} alt={c.name} fill sizes="(min-width: 1024px) 176px, (min-width: 640px) 160px, 112px" className="object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl">{c.emoji ?? "🧴"}</span>
                )}
              </span>
              <span className={`text-base sm:text-xl lg:text-2xl ${i === active ? "text-[#B8925A] font-semibold" : "text-text-secondary group-hover:text-[#020B27]"}`}>
                {c.name}
              </span>
            </button>
            );
          })}
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
          aria-valuenow={active}
          aria-valuetext={current?.name}
        >
          {/* piste grise */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 rounded-full" />
          {/* portion remplie (dégradé doré) à gauche du curseur */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full bg-linear-to-r from-[#D8B778] to-[#9E7A45] ${
              drag === null ? "transition-[width] duration-300" : ""
            }`}
            style={{ width: `${progress * 100}%` }}
          />
          {/* curseur (point) */}
          <span
            className={`absolute top-1/2 w-3.5 h-3.5 rounded-full bg-green ring-4 ring-[#B8925A]/25 shadow
                       -translate-y-1/2 -translate-x-1/2 group-hover:scale-110 group-active:scale-95
                       cursor-grab active:cursor-grabbing ${drag === null ? "transition-[left] duration-300" : ""}`}
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        {/* Carrousel produits (défilement libre) */}
        <div className="flex gap-3 sm:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
          {current.products.map((p) => (
            <div key={p.id} className="shrink-0 w-[46%] sm:w-[45%] lg:w-[23%] snap-start">
              <MiniProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
