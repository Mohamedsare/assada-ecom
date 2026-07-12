"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";

interface ProductCarouselProps {
  label: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  viewAllColor?: string;
  /** Défilement automatique horizontal (marquee), pausé au survol/toucher. */
  autoScroll?: boolean;
}

export default function ProductCarousel({
  label,
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllColor = "text-green",
  autoScroll = false,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  // Pour un marquee fluide et infini, on affiche la liste deux fois et on
  // « rembobine » dès qu'on a défilé la longueur d'un jeu complet.
  const loop = autoScroll && products.length > 1;
  const rendered = loop ? [...products, ...products] : products;

  useEffect(() => {
    if (!loop) return;
    const el = scrollRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SPEED = 0.5; // px par frame (~30 px/s)
    let raf = 0;

    const step = () => {
      if (!pausedRef.current) {
        // Point de rembobinage = position du 1er élément du 2e jeu (identique visuellement à 0).
        const wrap = el.querySelector<HTMLElement>("[data-loop-start]")?.offsetLeft ?? el.scrollWidth / 2;
        el.scrollLeft += SPEED;
        if (el.scrollLeft >= wrap) el.scrollLeft -= wrap;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [loop, products.length]);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : 240; // largeur card + gap
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="relative">
      {/* En-tête */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${viewAllColor}`}>
            {label}
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-[#0A2A52]">{title}</h2>
          {subtitle && <p className="text-text-secondary text-sm mt-0.5">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className={`flex items-center gap-1 font-semibold text-sm hover:underline shrink-0 ${viewAllColor}`}
        >
          Voir tout <ChevronRight size={15} />
        </Link>
      </div>

      {/* Flèche gauche */}
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute -left-4 top-1/2 mt-4 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-green hover:border-green shadow-sm transition-colors z-10"
        aria-label="Précédent"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Flèche droite */}
      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute -right-4 top-1/2 mt-4 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-green hover:border-green shadow-sm transition-colors z-10"
        aria-label="Suivant"
      >
        <ChevronRight size={18} />
      </button>

      {/* Piste de défilement */}
      <div
        ref={scrollRef}
        onMouseEnter={loop ? pause : undefined}
        onMouseLeave={loop ? resume : undefined}
        onTouchStart={loop ? pause : undefined}
        onTouchEnd={loop ? resume : undefined}
        className={`flex gap-4 overflow-x-auto scrollbar-hide pb-1 ${loop ? "" : "scroll-smooth snap-x snap-mandatory"}`}
      >
        {rendered.map((product, i) => (
          <div
            key={`${product.id}-${i}`}
            data-card
            {...(loop && i === products.length ? { "data-loop-start": "" } : {})}
            className={`shrink-0 w-[46%] sm:w-[30%] md:w-[31%] lg:w-[19%] ${loop ? "" : "snap-start"}`}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
