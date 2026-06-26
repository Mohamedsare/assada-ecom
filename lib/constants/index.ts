export const SITE_NAME = "Odm's Shopping";
export const SITE_EMAIL = "odms-shopping@gmail.com";
export const SITE_PHONE = "+241 62 57 37 48";
export const WHATSAPP_NUMBER = "24162573748";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://odmshop.com";

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
  { label: "Contact", href: "/contact" },
] as const;
