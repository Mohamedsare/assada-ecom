import { create } from "zustand";
import { DEFAULT_DELIVERY_FEE, DEFAULT_FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

interface StoreConfig {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  setConfig: (c: { deliveryFee: number; freeDeliveryThreshold: number }) => void;
}

/**
 * Configuration boutique (frais de livraison, seuil de gratuité) partagée par
 * le panier et le checkout. Hydratée depuis les Paramètres admin via ConfigHydrator ;
 * démarre sur les valeurs par défaut pour éviter tout flash.
 */
export const useConfigStore = create<StoreConfig>((set) => ({
  deliveryFee: DEFAULT_DELIVERY_FEE,
  freeDeliveryThreshold: DEFAULT_FREE_DELIVERY_THRESHOLD,
  setConfig: (c) => set(c),
}));
