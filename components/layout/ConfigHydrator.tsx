"use client";

import { useEffect } from "react";
import { useConfigStore } from "@/stores/config";

/**
 * Injecte la configuration boutique (lue côté serveur depuis les Paramètres admin)
 * dans le store client, afin que le panier et le checkout utilisent les vrais
 * frais de livraison et seuil de gratuité.
 */
export default function ConfigHydrator({
  deliveryFee,
  freeDeliveryThreshold,
}: {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}) {
  const setConfig = useConfigStore((s) => s.setConfig);

  useEffect(() => {
    setConfig({ deliveryFee, freeDeliveryThreshold });
  }, [deliveryFee, freeDeliveryThreshold, setConfig]);

  return null;
}
