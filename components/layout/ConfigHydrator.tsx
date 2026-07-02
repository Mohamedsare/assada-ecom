"use client";

import { useEffect } from "react";
import { useConfigStore } from "@/stores/config";

/**
 * Injecte la configuration boutique (lue côté serveur depuis les Paramètres admin)
 * dans le store client : frais de livraison / seuil de gratuité (panier & checkout)
 * et images de pages éditables (bannières hero, bannières de pages).
 */
export default function ConfigHydrator({
  deliveryFee,
  freeDeliveryThreshold,
  images,
}: {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  images?: Record<string, string>;
}) {
  const setConfig = useConfigStore((s) => s.setConfig);
  const setImages = useConfigStore((s) => s.setImages);

  useEffect(() => {
    setConfig({ deliveryFee, freeDeliveryThreshold });
  }, [deliveryFee, freeDeliveryThreshold, setConfig]);

  useEffect(() => {
    if (images && Object.keys(images).length > 0) setImages(images);
  }, [images, setImages]);

  return null;
}
