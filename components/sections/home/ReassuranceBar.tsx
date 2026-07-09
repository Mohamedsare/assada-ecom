"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { WHATSAPP_NUMBER, SITE_EMAIL } from "@/lib/constants";

/** Barre de réassurance 4 colonnes (fond sombre) façon apia — contenu RYTA.
 *  Mobile : slider automatique qui centre l'élément courant. Desktop : grille 4 colonnes. */
const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Produits authentiques",
    text: "Cosmétiques et parfums 100% originaux, sélectionnés avec soin.",
  },
  {
    icon: MessageCircle,
    title: "Conseil & support",
    text: `Nous vous accompagnons sur WhatsApp au +${WHATSAPP_NUMBER} ou ${SITE_EMAIL}.`,
  },
  {
    icon: BadgeCheck,
    title: "Paiement à la livraison",
    text: "Payez en espèces à la réception, en toute confiance.",
  },
  {
    icon: Truck,
    title: "Livraison express",
    text: "Livraison partout au Maroc en 24 à 72h. Gratuite à partir de 500 DH pour tout le Maroc.",
  },
];

const INTERVAL = 3000;

export default function ReassuranceBar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Avance automatique (mise en pause pendant une interaction utilisateur).
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ITEMS.length), INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  // Centre l'élément courant dans la piste — uniquement si elle est scrollable (mobile).
  useEffect(() => {
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth) return;
    const el = track.children[index] as HTMLElement | undefined;
    if (!el) return;
    track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2, behavior: "smooth" });
  }, [index]);

  return (
    <section className="bg-green text-white py-10 px-4">
      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="max-w-7xl mx-auto flex lg:grid lg:grid-cols-4 gap-4 lg:gap-8 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide"
      >
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="shrink-0 w-[70%] sm:w-[42%] lg:w-auto snap-center text-center flex flex-col items-center first:ml-[15%] last:mr-[15%] sm:first:ml-[29%] sm:last:mr-[29%] lg:first:ml-0 lg:last:mr-0"
          >
            <Icon size={60} className="text-white mb-3" strokeWidth={1.6} />
            <p className="font-bold mb-1.5">{title}</p>
            <p className="text-xs text-white/70 leading-relaxed max-w-[220px]">{text}</p>
          </div>
        ))}
      </div>

      {/* Points indicateurs (mobile) */}
      <div className="flex lg:hidden items-center justify-center gap-2 mt-6">
        {ITEMS.map((it, i) => (
          <button
            key={it.title}
            onClick={() => setIndex(i)}
            aria-label={`Aller à ${it.title}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-[#D8B778]" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
