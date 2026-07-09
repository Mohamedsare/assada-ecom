"use client";

import { useEffect, useState } from "react";

export interface ScrollState {
  /** `true` si le dernier mouvement significatif était vers le bas. */
  scrolledDown: boolean;
  /** `true` tant qu'on est proche du haut de page (sous le seuil). */
  atTop: boolean;
}

/**
 * Suit le sens du scroll et la proximité du haut de page.
 *
 * Permet de masquer/afficher des barres fixes selon le sens :
 *  - header : masqué en descendant, visible en montant / en haut ;
 *  - bottom nav : visible en descendant, masqué en montant (mais visible en haut).
 *
 * @param threshold  distance (px) sous laquelle on considère être « en haut »
 * @param delta      amplitude minimale (px) d'un mouvement pris en compte (anti-jitter)
 */
export function useScrollDirection(threshold = 80, delta = 6): ScrollState {
  const [state, setState] = useState<ScrollState>({ scrolledDown: false, atTop: true });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const atTop = y <= threshold;
      const diff = y - lastY;
      if (Math.abs(diff) > delta) {
        setState({ scrolledDown: diff > 0, atTop });
        lastY = y;
      } else {
        // Garde `atTop` à jour même sans mouvement franc (ex. retour tout en haut).
        setState((s) => (s.atTop === atTop ? s : { ...s, atTop }));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, delta]);

  return state;
}
