import { create } from "zustand";
import { DEFAULT_DELIVERY_FEE, DEFAULT_FREE_DELIVERY_THRESHOLD, DEFAULT_HERO_SLIDES, PAGE_IMAGE_DEFAULTS, type HeroSlide } from "@/lib/constants";

interface StoreConfig {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  /** Images éditables du site (bannières promo, bannières de pages…). */
  images: Record<string, string>;
  /** Slides du slider d'accueil (images ou vidéos), gérés en admin. */
  heroSlides: HeroSlide[];
  setConfig: (c: { deliveryFee: number; freeDeliveryThreshold: number }) => void;
  setImages: (images: Record<string, string>) => void;
  setHeroSlides: (slides: HeroSlide[]) => void;
}

/**
 * Configuration boutique (frais de livraison, seuil de gratuité, images de pages)
 * partagée par le panier, le checkout et les bannières publiques. Hydratée depuis les
 * Paramètres admin via ConfigHydrator ; démarre sur les valeurs par défaut (pas de flash).
 */
export const useConfigStore = create<StoreConfig>((set) => ({
  deliveryFee: DEFAULT_DELIVERY_FEE,
  freeDeliveryThreshold: DEFAULT_FREE_DELIVERY_THRESHOLD,
  images: { ...PAGE_IMAGE_DEFAULTS },
  heroSlides: DEFAULT_HERO_SLIDES,
  setConfig: (c) => set(c),
  setImages: (images) => set((s) => ({ images: { ...s.images, ...images } })),
  setHeroSlides: (heroSlides) => set({ heroSlides }),
}));

/** Hook pratique : URL d'une image de page (repli sur le défaut). */
export function usePageImage(key: string): string {
  return useConfigStore((s) => s.images[key] ?? PAGE_IMAGE_DEFAULTS[key] ?? "");
}
