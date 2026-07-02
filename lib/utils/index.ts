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
  return `ASSADA-${year}-${random}`;
}

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Message WhatsApp de commande complet : reprend toutes les options choisies
 * par le client (couleur, taille, quantité, prix unitaire, total, lien).
 */
export function getProductOrderWhatsAppUrl(opts: {
  name: string;
  brand?: string | null;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  url?: string;
}): string {
  const lines: string[] = [
    "Bonjour Assada, je souhaite commander ce produit :",
    "",
    `🛍️ ${opts.name}`,
  ];
  if (opts.brand) lines.push(`Marque : ${opts.brand}`);
  if (opts.color) lines.push(`Couleur : ${opts.color}`);
  if (opts.size && opts.size !== "Unique") lines.push(`Taille : ${opts.size}`);
  lines.push(`Quantité : ${opts.quantity}`);
  lines.push(`Prix unitaire : ${formatPrice(opts.unitPrice)}`);
  lines.push(`Total : ${formatPrice(opts.unitPrice * opts.quantity)}`);
  if (opts.url) lines.push(`Lien : ${opts.url}`);
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

export const WHATSAPP_DEFAULT_MESSAGE = "Bonjour Assada, je suis intéressé par vos produits.";
