"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ShoppingBag, Tag, Truck, RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";
import { useConfigStore } from "@/stores/config";

/** Images supplémentaires du dossier /public/banners ajoutées au slider (après les 3 éditables). */
const EXTRA_HERO_IMAGES = ["/banners/b1.png", "/banners/b2.png", "/banners/b3.png"];
/** Nombre total de slides = 3 éditables (home_hero_1/2/3) + les images supplémentaires. */
const HERO_COUNT = 3 + EXTRA_HERO_IMAGES.length;

/** Bande de réassurance qui défile en boucle sous la bannière (façon apia). */
const MARQUEE_ITEMS = [
  { icon: Truck, text: "Livraison gratuite à partir de 500 DH" },
  { icon: RotateCcw, text: "Retours gratuits sous 30 jours" },
  { icon: ShieldCheck, text: "Paiement sécurisé" },
  { icon: MessageCircle, text: "Support WhatsApp 7j/7" },
];

const SLIDES = [
  {
    id: 1,
    image: "/banners/banner2-accueil.png",
    title: "Beauté, bien-être &",
    titleAccent: "terroir marocain",
    titleSuffix: "à Casablanca",
    subtitle:
      "Produits de beauté, compléments alimentaires et produits du terroir marocain, livrés partout au Maroc en 24 à 72h.",
    cta1: { label: "Découvrir la boutique", href: "/boutique" },
    cta2: { label: "Voir les promotions", href: "/promotions" },
  },
  {
    id: 2,
    image: "/banners/banner3-accuiel.png",
    title: "Nouveautés",
    titleAccent: "de la semaine",
    titleSuffix: "disponibles",
    subtitle:
      "Beauté, compléments alimentaires et produits locaux. Payez à la livraison.",
    cta1: { label: "Voir les nouveautés", href: "/nouveautes" },
    cta2: { label: "Voir les promotions", href: "/promotions" },
  },
  {
    id: 3,
    image: "/banners/banner4-accueil.png",
    title: "Promotions",
    titleAccent: "du moment",
    titleSuffix: "à ne pas manquer",
    subtitle:
      "Profitez de nos offres spéciales sur une sélection de produits.",
    cta1: { label: "Voir les promotions", href: "/promotions" },
    cta2: { label: "Découvrir la boutique", href: "/boutique" },
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  // Images éditables depuis « Gestion des pages » (repli sur les images par défaut du slide),
  // suivies des images supplémentaires du dossier /public/banners.
  const images = useConfigStore((s) => s.images);
  const heroImages = [
    images.home_hero_1, images.home_hero_2, images.home_hero_3,
    ...EXTRA_HERO_IMAGES,
  ];

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
    goTo((current + 1) % HERO_COUNT);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Le texte (titre, CTA…) tourne sur les 3 slides ; les images, elles, défilent sur toutes.
  const slide = SLIDES[current % SLIDES.length];

  return (
    <>
    <section className="relative bg-night text-white overflow-hidden select-none">
      {/* ── Image en arrière-plan (slider) ── */}
      <div className="absolute inset-0 z-0">
        <Image
          key={`bg-${current}`}
          src={heroImages[current] ?? slide.image}
          alt={`RYTA — ${slide.titleAccent}`}
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
        <div className="grid lg:grid-cols-2 min-h-44 md:min-h-56 items-center">

          {/* ── Texte gauche ── */}
          <div
            key={`text-${current}`}
            className="py-5 md:py-6 lg:pr-8 z-10 animate-fade-slide-in"
          >
            <div className="inline-flex items-center gap-2 bg-green/20 text-green-light text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border border-green-light/30">
              <span className="w-1.5 h-1.5 bg-green-light rounded-full animate-pulse" />
              Livraison partout au Maroc en 24–72h
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              {slide.title}{" "}
              <span className="text-green-light">{slide.titleAccent}</span>
              <br />
              {slide.titleSuffix}
            </h1>

            <p className="text-gray-400 text-base md:text-lg mb-6 leading-relaxed max-w-md">
              {slide.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-3">
              <Link
                href={slide.cta1.href}
                className="inline-flex items-center justify-center gap-2 bg-green hover:bg-[#9E7A45] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
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
            <div className="flex gap-8 mt-5 pt-4 border-t border-white/10">
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
        {heroImages.map((_, i) => (
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

    {/* Bande de réassurance collée à la bannière — défile en boucle infinie */}
    <div className="bg-[#F5F1EA] border-b border-black/5 overflow-hidden">
      <div className="flex w-max animate-marquee py-4">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-3 px-10 shrink-0">
              <Icon size={20} className="text-[#B8925A] shrink-0" strokeWidth={1.75} />
              <span className="text-sm font-medium text-[#020B27] whitespace-nowrap">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
