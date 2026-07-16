import {
  SITE_URL, SITE_NAME, SITE_EMAIL, SITE_DESCRIPTION,
  WHATSAPP_NUMBER, CASABLANCA_DISTRICTS, SHOP_GEO, SOCIAL_LINKS, SHOP_ADDRESS,
} from "@/lib/constants";

const base = SITE_URL.replace(/\/$/, "");
const phone = `+${WHATSAPP_NUMBER}`;

/**
 * LocalBusiness/Store — signal SEO local le plus important.
 * areaServed couvre Casablanca et ses quartiers.
 */
export const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${base}/#store`,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: base,
  image: `${base}/ryta.png`,
  logo: `${base}/ryta.png`,
  telephone: phone,
  email: SITE_EMAIL,
  priceRange: "DH",
  currenciesAccepted: "MAD",
  paymentAccepted: "Paiement à la livraison",
  address: {
    "@type": "PostalAddress",
    streetAddress: SHOP_ADDRESS,
    addressLocality: SHOP_GEO.placename,
    addressRegion: "Casablanca-Settat",
    addressCountry: "MA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SHOP_GEO.latitude,
    longitude: SHOP_GEO.longitude,
  },
  areaServed: [
    { "@type": "City", name: "Casablanca" },
    ...CASABLANCA_DISTRICTS.map((d) => ({ "@type": "Place", name: d })),
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: phone,
    contactType: "customer service",
    availableLanguage: ["French"],
    areaServed: "MA",
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
  inLanguage: "fr-MA",
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
