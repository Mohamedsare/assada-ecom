import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Odm's Shopping — Boutique en ligne au Gabon",
    template: "%s | Odm's Shopping",
  },
  description:
    "Votre boutique en ligne n°1 au Gabon. Chaussures, vêtements, accessoires et électroniques avec livraison rapide partout au Gabon. Paiement à la livraison disponible.",
  keywords: [
    "boutique en ligne Gabon",
    "shopping en ligne Gabon",
    "chaussures Gabon",
    "vêtements Gabon",
    "livraison Libreville",
    "Odm's Shopping",
  ],
  openGraph: {
    title: "Odm's Shopping — Boutique en ligne au Gabon",
    description: "Votre boutique en ligne n°1 au Gabon",
    locale: "fr_GA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={geistSans.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
