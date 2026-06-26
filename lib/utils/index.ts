import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
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
  return `ODMS-${year}-${random}`;
}

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/24162573748?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE = "Bonjour Odm's Shopping, je suis intéressé par vos produits.";
