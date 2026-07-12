import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(amount) + " DH";
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function calculateDiscount(oldPrice: number, currentPrice: number): number {
  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${year}-${random}`;
}

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Message WhatsApp de commande complet : reprend toutes les options choisies
 * par le client (couleur, taille, quantité) et détaille le prix, frais de
 * livraison inclus dans le total.
 *
 * `imageUrl` est placé en tête du message : WhatsApp génère alors un aperçu
 * (miniature) du produit. Il faut une URL publique https (l'URL de stockage
 * du produit), pas le lien de la page — un lien localhost ne s'aperçoit pas.
 */
export function getProductOrderWhatsAppUrl(opts: {
  name: string;
  brand?: string | null;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
  /** Frais de livraison déjà calculés (0 = gratuite). Inclus dans le total. */
  deliveryFee?: number;
}): string {
  const subtotal = opts.unitPrice * opts.quantity;
  const delivery = opts.deliveryFee ?? 0;
  const total = subtotal + delivery;

  const lines: string[] = ["Bonjour RYTA, je souhaite commander ce produit :", ""];
  if (opts.imageUrl) lines.push(opts.imageUrl, "");
  lines.push(`🛍️ ${opts.name}`);
  if (opts.brand) lines.push(`Marque : ${opts.brand}`);
  if (opts.color) lines.push(`Couleur : ${opts.color}`);
  if (opts.size && opts.size !== "Unique") lines.push(`Taille : ${opts.size}`);
  lines.push(`Quantité : ${opts.quantity}`);
  lines.push(`Prix unitaire : ${formatPrice(opts.unitPrice)}`);
  if (opts.quantity > 1) lines.push(`Sous-total : ${formatPrice(subtotal)}`);
  lines.push(`Frais de livraison : ${delivery === 0 ? "Gratuite" : formatPrice(delivery)}`);
  lines.push(`Total à payer : ${formatPrice(total)}`);
  return getWhatsAppUrl(lines.join("\n"));
}

/** Un article de commande pour le message WhatsApp du panier. */
export interface WhatsAppOrderItem {
  name: string;
  brand?: string | null;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
}

/**
 * Message WhatsApp de commande pour le panier complet : liste chaque produit
 * (image, options, quantité, prix) puis le récapitulatif avec les frais de
 * livraison inclus dans le total.
 *
 * ⚠️ WhatsApp ne génère l'aperçu (miniature) que du 1er lien du message : seule
 * l'image du premier article s'affichera en vignette, les autres restent en URL.
 */
export function getCartOrderWhatsAppUrl(opts: {
  items: WhatsAppOrderItem[];
  deliveryFee?: number;
}): string {
  const subtotal = opts.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const delivery = opts.deliveryFee ?? 0;
  const total = subtotal + delivery;

  const lines: string[] = ["Bonjour RYTA, je souhaite passer cette commande :", ""];
  opts.items.forEach((it) => {
    if (it.imageUrl) lines.push(it.imageUrl);
    lines.push(`🛍️ ${it.name}${it.brand ? ` — ${it.brand}` : ""}`);
    const variant = [it.color, it.size && it.size !== "Unique" ? it.size : null].filter(Boolean);
    if (variant.length) lines.push(`   ${variant.join(" · ")}`);
    lines.push(
      `   Quantité : ${it.quantity} × ${formatPrice(it.unitPrice)} = ${formatPrice(it.unitPrice * it.quantity)}`
    );
    lines.push("");
  });
  lines.push(`Sous-total : ${formatPrice(subtotal)}`);
  lines.push(`Frais de livraison : ${delivery === 0 ? "Gratuite" : formatPrice(delivery)}`);
  lines.push(`Total à payer : ${formatPrice(total)}`);
  return getWhatsAppUrl(lines.join("\n"));
}

/**
 * Lien WhatsApp vers un numéro client marocain.
 * Normalise les formats courants (+212…, 0XX…, 212…) en msisdn international sans « + ».
 */
export function getClientWhatsAppUrl(phone: string, message: string): string {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("212")) {
    // déjà préfixé
  } else if (digits.startsWith("0")) {
    digits = "212" + digits.slice(1);
  } else if (digits.length <= 9) {
    digits = "212" + digits;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE = "Bonjour RYTA, je suis intéressé par vos produits.";
