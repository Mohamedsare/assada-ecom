import { createElement } from "react";
import {
  SprayCan, Palette, Sparkles, Droplets, Scissors,
  Bath, Brush, Gift, Leaf, ShoppingBag, type LucideIcon,
} from "lucide-react";

/**
 * Icône réelle (lucide) associée à chaque catégorie de la boutique.
 * Remplace les emojis dans les menus/sections pour un rendu premium et cohérent.
 * Repli sur ShoppingBag pour une catégorie inconnue.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  parfums:         SprayCan,
  maquillage:      Palette,
  "soins-visage":  Sparkles,
  "soins-corps":   Droplets,
  "soins-cheveux": Scissors,
  hygiene:         Bath,
  accessoires:     Brush,
  cadeaux:         Gift,
  "bien-etre":     Leaf,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? ShoppingBag;
}

export default function CategoryIcon({
  slug, size = 16, className, strokeWidth = 2,
}: {
  slug: string; size?: number; className?: string; strokeWidth?: number;
}) {
  // createElement (plutôt que <Icon/>) évite le warning « composant créé pendant le rendu ».
  return createElement(getCategoryIcon(slug), { size, strokeWidth, className, "aria-hidden": true });
}
