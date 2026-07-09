"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ShoppingBag, Tag, Truck, RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";
import { useConfigStore } from "@/stores/config";
import { DEFAULT_HERO_SLIDES } from "@/lib/constants";

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
  // Slides (images ou vidéos) gérés depuis « Gestion des pages » → slider d'accueil.
  const storeSlides = useConfigStore((s) => s.heroSlides);
  const heroSlides = storeSlides.length > 0 ? storeSlides : DEFAULT_HERO_SLIDES;
  const heroCount = heroSlides.length;

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
    setCurrent((c) => (c + 1) % heroCount);
  }, [heroCount]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Index borné au rendu : si le nombre de slides change (édition admin), on reste valide.
  const index = heroCount > 0 ? current % heroCount : 0;
  // Le texte (titre, CTA…) tourne sur les 3 slides éditoriaux ; le fond défile sur tous les slides.
  const slide = SLIDES[index % SLIDES.length];
  const media = heroSlides[index] ?? heroSlides[0];

  return (
    <>
    <section className="relative bg-night text-white overflow-hidden select-none">
      {/* ── Média en arrière-plan (slider : image ou vidéo) ── */}
      <div className="absolute inset-0 z-0">
        {media?.type === "video" ? (
          <video
            key={`bg-${index}`}
            src={media.url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-right animate-fade-bg"
          />
        ) : (
          <Image
            key={`bg-${index}`}
            src={media?.url ?? slide.image}
            alt={`RYTA — ${slide.titleAccent}`}
            fill
            priority
            className="object-cover object-right animate-fade-bg"
            sizes="100vw"
          />
        )}
        {/* Dégradé pour lisibilité — plus léger sur mobile pour mieux voir l'image */}
        <div className="absolute inset-0 bg-night/25 lg:hidden" />
        <div className="absolute inset-0 bg-linear-to-r from-night/60 via-night/25 to-transparent lg:from-night/80 lg:via-night/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 min-h-44 md:min-h-56 items-center">

          {/* ── Texte gauche ── */}
          <div
            key={`text-${index}`}
            className="py-5 md:py-6 lg:pr-8 z-10 animate-fade-slide-in"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3 md:mb-5">
              {slide.title}{" "}
              <span className="text-green-light">{slide.titleAccent}</span>
              <br />
              {slide.titleSuffix}
            </h1>

            <p className="text-gray-400 text-sm md:text-lg mb-4 md:mb-6 leading-relaxed max-w-md">
              {slide.subtitle}
            </p>

            <div className="flex flex-col items-start sm:flex-row sm:items-center sm:flex-nowrap gap-3">
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
          </div>

          {/* Colonne droite vide : l'image est en arrière-plan */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all rounded-full ${
              i === index
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
