"use client";

import { useEffect } from "react";
import { useConfigStore } from "@/stores/config";
import type { HeroSlide } from "@/lib/constants";

/**
 * Injecte la configuration boutique (lue côté serveur depuis les Paramètres admin)
 * dans le store client : frais de livraison / seuil de gratuité (panier & checkout),
 * images de pages éditables (bannières de pages) et slides du slider d'accueil.
 */
export default function ConfigHydrator({
  deliveryFee,
  freeDeliveryThreshold,
  images,
  heroSlides,
}: {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  images?: Record<string, string>;
  heroSlides?: HeroSlide[];
}) {
  const setConfig = useConfigStore((s) => s.setConfig);
  const setImages = useConfigStore((s) => s.setImages);
  const setHeroSlides = useConfigStore((s) => s.setHeroSlides);

  useEffect(() => {
    setConfig({ deliveryFee, freeDeliveryThreshold });
  }, [deliveryFee, freeDeliveryThreshold, setConfig]);

  useEffect(() => {
    if (images && Object.keys(images).length > 0) setImages(images);
  }, [images, setImages]);

  useEffect(() => {
    if (heroSlides && heroSlides.length > 0) setHeroSlides(heroSlides);
  }, [heroSlides, setHeroSlides]);

  return null;
}
