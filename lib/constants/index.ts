export const SITE_NAME = "Odm's Shopping";

/** Valeurs de livraison par défaut (surchargées par les Paramètres boutique en base). */
export const DEFAULT_DELIVERY_FEE = 2000;
export const DEFAULT_FREE_DELIVERY_THRESHOLD = 100_000;

export const SITE_EMAIL = "odms-shopping@gmail.com";
export const SITE_PHONE = "+241 62 57 37 48";
export const WHATSAPP_NUMBER = "24162573748";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://odms-shopping.com";

export const SITE_DESCRIPTION =
  "Odm's Shopping, votre boutique en ligne n°1 au Gabon. Achetez chaussures, vêtements, accessoires et produits électroniques avec livraison rapide partout au Gabon : Libreville, Port-Gentil, Franceville et toutes les villes. Paiement à la livraison, Airtel Money et Moov Money. Support WhatsApp 7j/7.";

/** Villes desservies — utilisées pour le SEO local (areaServed) et le checkout. */
export const GABON_CITIES = [
  "Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda",
  "Mouila", "Lambaréné", "Tchibanga", "Koulamoutou", "Makokou",
] as const;

/** Coordonnées de la boutique (Libreville) pour le balisage géo / LocalBusiness. */
export const SHOP_GEO = {
  latitude: 0.4162,
  longitude: 9.4673,
  region: "GA",
  placename: "Libreville",
  country: "Gabon",
} as const;

export const SOCIAL_LINKS = {
  tiktok: "https://www.tiktok.com/@odmsshopping",
  facebook: "https://www.facebook.com/odmsshopping",
  instagram: "https://www.instagram.com/odms.shopping",
} as const;

/** Mots-clés SEO Gabon (marché + intentions d'achat locales). */
export const SEO_KEYWORDS = [
  "boutique en ligne Gabon", "shopping en ligne Gabon", "e-commerce Gabon",
  "acheter en ligne Libreville", "achat chaussures Gabon", "vêtements homme Gabon",
  "vêtements femme Gabon", "accessoires téléphone Gabon", "acheter téléphone Libreville",
  "boutique électronique Gabon", "livraison Libreville", "livraison Port-Gentil",
  "paiement à la livraison Gabon", "Airtel Money", "Moov Money", "Odm's Shopping",
] as const;

export const CATEGORIES = [
  { name: "Chaussures Homme", slug: "chaussures-homme", emoji: "👟" },
  { name: "Chaussures Femme", slug: "chaussures-femme", emoji: "👠" },
  { name: "Vêtements Homme", slug: "vetements-homme", emoji: "👔" },
  { name: "Vêtements Femme", slug: "vetements-femme", emoji: "👗" },
  { name: "Accessoires Homme", slug: "accessoires-homme", emoji: "⌚" },
  { name: "Accessoires Femme", slug: "accessoires-femme", emoji: "👜" },
  { name: "Électroniques", slug: "electroniques", emoji: "📱" },
  { name: "PC & Accessoires", slug: "pc-accessoires", emoji: "💻" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  out_for_delivery: "En cours de livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
  returned: "Retournée",
};

export const PAYMENT_METHODS = [
  { id: "cash_on_delivery", label: "Espèces à la livraison", icon: "💵" },
  { id: "airtel_money", label: "Airtel Money", icon: "📲" },
  { id: "moov_money", label: "Moov Money", icon: "📱" },
] as const;

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
] as const;
