import { create } from "zustand";
import { DEFAULT_DELIVERY_FEE, DEFAULT_FREE_DELIVERY_THRESHOLD, PAGE_IMAGE_DEFAULTS } from "@/lib/constants";

interface StoreConfig {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  /** Images éditables du site (bannières hero, bannières de pages…). */
  images: Record<string, string>;
  setConfig: (c: { deliveryFee: number; freeDeliveryThreshold: number }) => void;
  setImages: (images: Record<string, string>) => void;
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
  setConfig: (c) => set(c),
  setImages: (images) => set((s) => ({ images: { ...s.images, ...images } })),
}));

/** Hook pratique : URL d'une image de page (repli sur le défaut). */
export function usePageImage(key: string): string {
  return useConfigStore((s) => s.images[key] ?? PAGE_IMAGE_DEFAULTS[key] ?? "");
}
