import { createElement } from "react";
import {
  SprayCan, Palette, Sparkles, Droplets, Droplet, Scissors,
  Bath, Brush, Gift, Leaf, LeafyGreen, Flower, Flower2, ShoppingBag,
  Pill, Zap, Shield, Activity, Soup, Moon, Bone, Heart,
  Nut, Sprout, Apple, Citrus, Candy, Coffee, type LucideIcon,
} from "lucide-react";

/**
 * Icône réelle (lucide) associée à chaque axe / catégorie de la boutique.
 * Remplace les emojis dans les menus/sections pour un rendu premium et cohérent.
 * Repli sur ShoppingBag pour un slug inconnu.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // ── Axes (catégories de tête) ──────────────────────────────
  beaute:                       Sparkles,
  "complements-alimentaires":   Pill,
  "produits-locaux":            LeafyGreen,

  // ── Beauté ─────────────────────────────────────────────────
  parfums:                 SprayCan,
  maquillage:              Palette,
  "soins-visage":          Sparkles,
  "soins-corps":           Droplets,
  "soins-cheveux":         Scissors,
  hygiene:                 Bath,
  "traditionnels-hammam":  Flower2,
  accessoires:             Brush,
  cadeaux:                 Gift,
  "bien-etre":             Leaf,

  // ── Compléments alimentaires ───────────────────────────────
  "complements-beaute":            Sparkles,
  "complements-vitalite-energie":  Zap,
  "complements-immunite":          Shield,
  "complements-minceur-detox":     Activity,
  "complements-digestion":         Soup,
  "complements-sommeil-stress":    Moon,
  "complements-articulations-os":  Bone,
  "complements-cheveux-ongles":    Brush,
  "complements-femme-homme":       Heart,

  // ── Produits locaux ────────────────────────────────────────
  miels:                    Droplet,
  "huiles-alimentaires":    Droplets,
  "amlou-pates-a-tartiner": Nut,
  "epices-aromates":        Sprout,
  "fruits-secs-dattes":     Apple,
  "olives-conserves":       Citrus,
  "confitures-sirops":      Candy,
  "thes-infusions":         Coffee,
  "eaux-florales-hydrolats": Flower,
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
