import { create } from "zustand";
import { DEFAULT_DELIVERY_FEE, DEFAULT_FREE_DELIVERY_THRESHOLD, DEFAULT_HERO_SLIDES, PAGE_IMAGE_DEFAULTS, SOCIAL_LINKS, type HeroSlide, type SocialLinks } from "@/lib/constants";

interface StoreConfig {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  /** Images éditables du site (bannières promo, bannières de pages…). */
  images: Record<string, string>;
  /** Slides du slider d'accueil (images ou vidéos), gérés en admin. */
  heroSlides: HeroSlide[];
  /** Liens réseaux sociaux (Facebook, TikTok, Instagram), gérés en admin. */
  socialLinks: SocialLinks;
  setConfig: (c: { deliveryFee: number; freeDeliveryThreshold: number }) => void;
  setImages: (images: Record<string, string>) => void;
  setHeroSlides: (slides: HeroSlide[]) => void;
  setSocialLinks: (links: SocialLinks) => void;
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
  socialLinks: { ...SOCIAL_LINKS },
  setConfig: (c) => set(c),
  setImages: (images) => set((s) => ({ images: { ...s.images, ...images } })),
  setHeroSlides: (heroSlides) => set({ heroSlides }),
  setSocialLinks: (socialLinks) => set({ socialLinks }),
}));

/** Hook pratique : URL d'une image de page (repli sur le défaut). */
export function usePageImage(key: string): string {
  return useConfigStore((s) => s.images[key] ?? PAGE_IMAGE_DEFAULTS[key] ?? "");
}

/** Hook pratique : liens réseaux sociaux (Facebook, TikTok, Instagram) définis en admin. */
export function useSocialLinks(): SocialLinks {
  return useConfigStore((s) => s.socialLinks);
}
