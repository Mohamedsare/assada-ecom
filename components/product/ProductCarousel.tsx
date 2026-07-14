"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";

interface ProductCarouselProps {
  /** @deprecated Ancien sur-titre — n'est plus affiché (un seul titre par section). */
  label?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  viewAllColor?: string;
  /** Défilement automatique horizontal (marquee), pausé au survol/toucher. */
  autoScroll?: boolean;
}

export default function ProductCarousel({
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

  // Points de pagination (mode non-auto) : une pastille par « page » visible.
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (loop) return; // le mode marquee n'a pas de points
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const pages = el.clientWidth > 0 ? Math.ceil(el.scrollWidth / el.clientWidth) : 0;
      setPageCount(pages > 1 ? pages : 0);
    };
    const onScroll = () => setActivePage(Math.round(el.scrollLeft / el.clientWidth));
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [loop, products.length]);

  const goToPage = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

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
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#0A2A52]">{title}</h2>
        {subtitle && <p className="text-text-secondary text-sm mt-0.5">{subtitle}</p>}
        <Link
          href={viewAllHref}
          className={`inline-flex items-center gap-1 font-semibold text-sm hover:underline mt-2 ${viewAllColor}`}
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

      {/* Points de pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              aria-label={`Aller à la page ${i + 1}`}
              aria-current={i === activePage}
              className={`h-2.5 rounded-full transition-all ${
                i === activePage ? "w-6 bg-green" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
