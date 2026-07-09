import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import {
  SITE_URL, SITE_NAME, SITE_DESCRIPTION, SEO_KEYWORDS, SHOP_GEO,
} from "@/lib/constants";
import { storeJsonLd, websiteJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RYTA — Boutique en ligne n°1 au Maroc | Livraison partout au Maroc",
    template: "%s | RYTA",
  },
  description: SITE_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "RYTA — Boutique en ligne n°1 à Casablanca",
    description: SITE_DESCRIPTION,
    images: [{ url: "/ryta.png", width: 500, height: 500, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RYTA — Boutique en ligne n°1 à Casablanca",
    description: SITE_DESCRIPTION,
    images: ["/ryta.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  other: {
    "geo.region": SHOP_GEO.region,
    "geo.placename": SHOP_GEO.placename,
    "geo.position": `${SHOP_GEO.latitude};${SHOP_GEO.longitude}`,
    "ICBM": `${SHOP_GEO.latitude}, ${SHOP_GEO.longitude}`,
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
        <JsonLd data={[storeJsonLd, websiteJsonLd]} />
        {children}
      </body>
    </html>
  );
}
