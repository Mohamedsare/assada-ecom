import {
  SITE_URL, SITE_NAME, SITE_EMAIL, SITE_DESCRIPTION,
  WHATSAPP_NUMBER, GABON_CITIES, SHOP_GEO, SOCIAL_LINKS,
} from "@/lib/constants";

const base = SITE_URL.replace(/\/$/, "");
const phone = `+${WHATSAPP_NUMBER}`;

/**
 * LocalBusiness/Store — signal SEO local le plus important.
 * areaServed couvre tout le Gabon + les principales villes.
 */
export const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${base}/#store`,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: base,
  image: `${base}/logo1.png`,
  logo: `${base}/logo1.png`,
  telephone: phone,
  email: SITE_EMAIL,
  priceRange: "FCFA",
  currenciesAccepted: "XAF",
  paymentAccepted: "Espèces à la livraison, Airtel Money, Moov Money",
  address: {
    "@type": "PostalAddress",
    addressLocality: SHOP_GEO.placename,
    addressRegion: "Estuaire",
    addressCountry: "GA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SHOP_GEO.latitude,
    longitude: SHOP_GEO.longitude,
  },
  areaServed: [
    { "@type": "Country", name: "Gabon" },
    ...GABON_CITIES.map((city) => ({ "@type": "City", name: city })),
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: phone,
    contactType: "customer service",
    availableLanguage: ["French"],
    areaServed: "GA",
  },
  sameAs: [SOCIAL_LINKS.facebook, SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok],
} as const;

/** WebSite + SearchAction (sitelinks searchbox dans Google). */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${base}/#website`,
  url: base,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "fr-GA",
  publisher: { "@id": `${base}/#store` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${base}/recherche?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;
