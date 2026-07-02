"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ShoppingBag, Tag } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image: "/banners/banner2-accueil.png",
    title: "La beauté au",
    titleAccent: "meilleur prix",
    titleSuffix: "à Casablanca",
    subtitle:
      "Parfums, soins visage & cheveux, maquillage et hygiène au meilleur prix.",
    cta1: { label: "Découvrir la boutique", href: "/boutique" },
    cta2: { label: "Voir les promotions", href: "/promotions" },
  },
  {
    id: 2,
    image: "/banners/banner3-accuiel.png",
    title: "Nouveautés",
    titleAccent: "cosmétiques",
    titleSuffix: "disponibles",
    subtitle:
      "Parfums, maquillage et soins premium. Payez à la livraison.",
    cta1: { label: "Voir les nouveautés", href: "/nouveautes" },
    cta2: { label: "Voir les promotions", href: "/promotions" },
  },
  {
    id: 3,
    image: "/banners/banner4-accueil.png",
    title: "Promotions",
    titleAccent: "beauté",
    titleSuffix: "à ne pas manquer",
    subtitle:
      "Profitez de nos offres spéciales sur une sélection de produits cosmétiques.",
    cta1: { label: "Voir les promotions", href: "/promotions" },
    cta2: { label: "Découvrir la boutique", href: "/boutique" },
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative bg-night text-white overflow-hidden select-none">
      {/* ── Image en arrière-plan (slider) ── */}
      <div className="absolute inset-0 z-0">
        <Image
          key={`bg-${current}`}
          src={slide.image}
          alt={`Assada — ${slide.titleAccent}`}
          fill
          priority
          className="object-cover object-right animate-fade-bg"
          sizes="100vw"
        />
        {/* Dégradé pour lisibilité — plus léger sur mobile pour mieux voir l'image */}
        <div className="absolute inset-0 bg-night/25 lg:hidden" />
        <div className="absolute inset-0 bg-linear-to-r from-night/60 via-night/25 to-transparent lg:from-night/80 lg:via-night/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 min-h-90 md:min-h-110 items-center">

          {/* ── Texte gauche ── */}
          <div
            key={`text-${current}`}
            className="py-12 md:py-16 lg:pr-8 z-10 animate-fade-slide-in"
          >
            <div className="inline-flex items-center gap-2 bg-green/20 text-green-light text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-green-light/30">
              <span className="w-1.5 h-1.5 bg-green-light rounded-full animate-pulse" />
              Livraison rapide partout à Casablanca
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              {slide.title}{" "}
              <span className="text-green-light">{slide.titleAccent}</span>
              <br />
              {slide.titleSuffix}
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed max-w-md">
              {slide.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-3">
              <Link
                href={slide.cta1.href}
                className="inline-flex items-center justify-center gap-2 bg-green hover:bg-[#15803D] text-[#020B27] font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                <ShoppingBag size={16} />
                {slide.cta1.label}
                <ChevronRight size={15} />
              </Link>
              <Link
                href={slide.cta2.href}
                className="inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white/60 hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
              >
                <Tag size={16} />
                {slide.cta2.label}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
              {[
                { value: "500+", label: "Produits" },
                { value: "24h", label: "Livraison" },
                { value: "100%", label: "Authentiques" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-extrabold text-green-light">{s.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne droite vide : l'image est en arrière-plan */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all rounded-full ${
              i === current
                ? "w-6 h-2 bg-green-light"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

    </section>
  );
}
