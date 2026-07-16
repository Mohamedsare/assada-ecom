"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Truck, RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";
import { useConfigStore } from "@/stores/config";
import { DEFAULT_HERO_SLIDES } from "@/lib/constants";

/** Bande de réassurance qui défile en boucle sous la bannière (façon apia). */
const MARQUEE_ITEMS = [
  { icon: Truck, text: "Livraison gratuite à partir de 300 DH" },
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

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + heroCount) % heroCount);
  }, [heroCount]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Glisser/swipe manuel (tactile + souris) pour changer de slide.
  const dragStartX = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(dx) < 45) return; // simple clic → on ignore
    if (dx < 0) next();
    else prev();
  };

  // Index borné au rendu : si le nombre de slides change (édition admin), on reste valide.
  const index = heroCount > 0 ? current % heroCount : 0;
  // Le texte (titre, CTA…) tourne sur les 3 slides éditoriaux ; le fond défile sur tous les slides.
  const slide = SLIDES[index % SLIDES.length];
  const media = heroSlides[index] ?? heroSlides[0];

  // Titre : dernier mot mis en accent doré, le reste en blanc (préserve les retours à la ligne).
  const titleParts = media?.title
    ? (() => {
        const m = media.title.match(/^([\s\S]*?)(\S+)\s*$/);
        return m ? { head: m[1], accent: m[2] } : { head: "", accent: media.title };
      })()
    : null;

  return (
    <>
    <section
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerCancel={() => { dragStartX.current = null; }}
      className="relative bg-night text-white overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing h-64 sm:h-80 md:h-96 lg:h-100"
    >
      {/* ── Média en arrière-plan (slider : image ou vidéo) — sans texte ── */}
      <div className="absolute inset-0 z-0">
        {media?.type === "video" ? (
          <video
            key={`bg-${index}`}
            src={media.url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center animate-fade-bg"
          />
        ) : (
          <Image
            key={`bg-${index}`}
            src={media?.url ?? slide.image}
            alt="Bannière RYTA"
            fill
            priority
            className="object-cover object-center animate-fade-bg"
            sizes="100vw"
          />
        )}
        {/* Dégradé de lisibilité : plus marqué à gauche quand un titre est affiché */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/45 to-transparent" />
        {media?.title && (
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/25 to-transparent" />
        )}
      </div>

      {/* Grand titre (géré par bannière dans « Gestion des pages ») */}
      {media?.title && (
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl w-full mx-auto px-6 md:px-10">
            <h1
              key={`title-${index}`}
              className="max-w-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white drop-shadow-lg animate-fade-slide-in whitespace-pre-line"
            >
              {titleParts?.head}
              <span className="text-green-light">{titleParts?.accent}</span>
            </h1>
          </div>
        </div>
      )}

      {/* Un seul bouton court, centré en bas — fond transparent, bordure blanche */}
      <Link
        href={media?.link || slide.cta1.href}
        className="absolute bottom-11 sm:bottom-14 left-1/2 -translate-x-1/2 z-20 inline-flex items-center justify-center bg-transparent border border-white sm:border-2 hover:bg-white/10 text-white font-bold uppercase tracking-wide px-4 py-1.5 text-[11px] sm:px-8 sm:py-3 sm:text-sm rounded-md transition-colors"
      >
        {"J'en profite"}
      </Link>

      {/* Points de position (slider) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all rounded-full ${
              i === index
                ? "w-8 h-2.5 bg-green-light"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
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
              <Icon size={20} className="text-[#2F9E44] shrink-0" strokeWidth={1.75} />
              <span className="text-sm font-medium text-[#0A2A52] whitespace-nowrap">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}
