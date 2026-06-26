"use client";

import { useRef } from "react";
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
}

export default function ProductCarousel({
  label,
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllColor = "text-green",
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">{title}</h2>
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
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-1 snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-card
            className="snap-start shrink-0 w-[46%] sm:w-[30%] md:w-[31%] lg:w-[19%]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
