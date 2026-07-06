export const SITE_NAME = "RYTA";

/** Valeurs de livraison par défaut (surchargées par les Paramètres boutique en base). */
export const DEFAULT_DELIVERY_FEE = 2000;
export const DEFAULT_FREE_DELIVERY_THRESHOLD = 100_000;

export const SITE_EMAIL = "contact@ryta.ma";
// ⚠️ Numéro placeholder — à remplacer par le vrai numéro RYTA.
export const SITE_PHONE = "+212 00 00 00 00";
export const WHATSAPP_NUMBER = "21200000000";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ryta.ma";

export const SITE_DESCRIPTION =
  "RYTA, votre boutique cosmétique à Casablanca. Parfums, maquillage, soins du visage, du corps et des cheveux, hygiène, accessoires et coffrets cadeaux. Livraison à Casablanca — Derb Ghalef, Maârif, Anfa et tous les quartiers. Paiement à la livraison. Boutique physique à Derb Ghalef. Support WhatsApp.";

/** Quartiers de Casablanca desservis — utilisés pour le SEO local (areaServed) et le checkout. */
export const CASABLANCA_DISTRICTS = [
  "Derb Ghalef", "Maârif", "Bd Abdelmoumen", "Gauthier", "Racine",
  "Bourgogne", "Anfa", "Ain Diab", "Oasis", "Sidi Maarouf",
  "Hay Hassani", "Ain Chock", "Californie", "Belvédère", "Mers Sultan",
  "Sidi Belyout", "Hay Mohammadi", "Ain Sebaâ", "Sidi Bernoussi",
  "Sidi Moumen", "Ben M'sik", "Sidi Othmane", "Moulay Rachid",
] as const;

/** Coordonnées de la boutique (Derb Ghalef, Casablanca) pour le balisage géo / LocalBusiness. */
export const SHOP_GEO = {
  latitude: 33.5606,
  longitude: -7.6261,
  region: "MA-CAS",
  placename: "Casablanca",
  country: "Maroc",
} as const;

export const SOCIAL_LINKS = {
  tiktok: "https://www.tiktok.com/@ryta",
  facebook: "https://www.facebook.com/ryta",
  instagram: "https://www.instagram.com/ryta",
} as const;

/** Mots-clés SEO Casablanca (marché cosmétique + intentions d'achat locales). */
export const SEO_KEYWORDS = [
  "boutique cosmétique Casablanca", "produits cosmétiques Casablanca", "parfums Casablanca",
  "parfums Derb Ghalef", "cosmétique Derb Ghalef", "boutique parfum Maârif",
  "soins corps Casablanca", "soins visage Casablanca", "soins cheveux Casablanca",
  "maquillage Casablanca", "livraison cosmétique Casablanca",
  "paiement à la livraison Casablanca", "RYTA Casablanca", "RYTA",
] as const;

export const CATEGORIES = [
  { name: "Parfums", slug: "parfums", emoji: "🌸" },
  { name: "Maquillage", slug: "maquillage", emoji: "💄" },
  { name: "Soins du visage", slug: "soins-visage", emoji: "✨" },
  { name: "Soins du corps", slug: "soins-corps", emoji: "🧴" },
  { name: "Soins des cheveux", slug: "soins-cheveux", emoji: "💆" },
  { name: "Hygiène", slug: "hygiene", emoji: "🧼" },
  { name: "Accessoires", slug: "accessoires", emoji: "💅" },
  { name: "Cadeaux", slug: "cadeaux", emoji: "🎁" },
  { name: "Bien-être", slug: "bien-etre", emoji: "🌿" },
] as const;

/**
 * Arborescence de navigation (méga-menu desktop + accordéon mobile).
 * Miroir curé de la taxonomie seedée en base (voir supabase-schema.sql).
 * Les liens pointent vers /boutique?categorie=<slug>.
 */
export type CategoryLeaf = { name: string; slug: string };
export type CategoryBranch = { name: string; slug: string; emoji: string; children: CategoryLeaf[] };

export const CATEGORY_TREE: CategoryBranch[] = [
  {
    name: "Parfums", slug: "parfums", emoji: "🌸",
    children: [
      { name: "Homme", slug: "parfums-homme" },
      { name: "Enfant", slug: "parfums-enfant" },
      { name: "Luxe", slug: "parfums-luxe" },
      { name: "Niche", slug: "parfums-niche" },
      { name: "Coffrets", slug: "parfums-coffrets" },
    ],
  },
  {
    name: "Maquillage", slug: "maquillage", emoji: "💄",
    children: [
      { name: "Teint", slug: "maquillage-teint" },
      { name: "Yeux", slug: "maquillage-yeux" },
      { name: "Lèvres", slug: "maquillage-levres" },
      { name: "Ongles", slug: "maquillage-ongles" },
    ],
  },
  {
    name: "Soins du visage", slug: "soins-visage", emoji: "✨",
    children: [
      { name: "Nettoyants", slug: "soins-visage-nettoyants" },
      { name: "Hydratants", slug: "soins-visage-hydratants" },
      { name: "Sérums", slug: "soins-visage-serums" },
      { name: "Masques", slug: "soins-visage-masques" },
      { name: "Contour des yeux", slug: "soins-visage-contour-yeux" },
      { name: "Anti-âge", slug: "soins-visage-anti-age" },
      { name: "Protection solaire", slug: "soins-visage-protection-solaire" },
    ],
  },
  {
    name: "Soins du corps", slug: "soins-corps", emoji: "🧴",
    children: [
      { name: "Laits & crèmes", slug: "soins-corps-laits-cremes" },
      { name: "Huiles", slug: "soins-corps-huiles" },
      { name: "Gommages", slug: "soins-corps-gommages" },
      { name: "Déodorants", slug: "soins-corps-deodorants" },
      { name: "Savons", slug: "soins-corps-savons" },
    ],
  },
  {
    name: "Soins des cheveux", slug: "soins-cheveux", emoji: "💆",
    children: [
      { name: "Shampoings", slug: "soins-cheveux-shampoings" },
      { name: "Après-shampoings", slug: "soins-cheveux-apres-shampoings" },
      { name: "Masques", slug: "soins-cheveux-masques" },
      { name: "Huiles", slug: "soins-cheveux-huiles" },
      { name: "Produits coiffants", slug: "soins-cheveux-coiffants" },
      { name: "Traitement particulier", slug: "soins-cheveux-traitement" },
    ],
  },
  {
    name: "Hygiène", slug: "hygiene", emoji: "🧼",
    children: [
      { name: "Gel douche", slug: "hygiene-gel-douche" },
      { name: "Hygiène intime", slug: "hygiene-intime" },
      { name: "Hygiène bucco-dentaire", slug: "hygiene-bucco-dentaire" },
      { name: "Désinfectants", slug: "hygiene-desinfectants" },
    ],
  },
  {
    name: "Accessoires", slug: "accessoires", emoji: "💅",
    children: [
      { name: "Trousses", slug: "accessoires-trousses" },
      { name: "Vaporisateurs", slug: "accessoires-vaporisateurs" },
      { name: "Pinceaux", slug: "accessoires-pinceaux" },
      { name: "Miroirs", slug: "accessoires-miroirs" },
      { name: "Éponges", slug: "accessoires-eponges" },
    ],
  },
  {
    name: "Cadeaux", slug: "cadeaux", emoji: "🎁",
    children: [
      { name: "Coffrets cadeaux", slug: "cadeaux-coffrets" },
      { name: "Paniers cadeaux", slug: "cadeaux-paniers" },
      { name: "Cartes cadeaux", slug: "cadeaux-cartes" },
      { name: "Miniatures", slug: "cadeaux-miniatures" },
      { name: "Éditions limitées", slug: "cadeaux-editions-limitees" },
      { name: "Cadeaux par occasion", slug: "cadeaux-occasions" },
    ],
  },
  {
    name: "Bien-être", slug: "bien-etre", emoji: "🌿",
    children: [
      { name: "Aromathérapie", slug: "bien-etre-aromatherapie" },
      { name: "Aérothérapie", slug: "bien-etre-aerotherapie" },
      { name: "Phytothérapie", slug: "bien-etre-phytotherapie" },
      { name: "Neurothérapie", slug: "bien-etre-neurotherapie" },
      { name: "Psychothérapie & relaxation", slug: "bien-etre-psychotherapie" },
    ],
  },
];

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
  { id: "cash_on_delivery", label: "Paiement à la livraison", icon: "💵" },
] as const;

/** Canal d'origine d'une commande (dashboard & gestion commandes). */
export const ORDER_CHANNEL_LABELS: Record<string, string> = {
  site: "Site web",
  whatsapp: "WhatsApp",
  store: "Boutique",
};

/**
 * Images éditables du site (page « Gestion des pages »).
 * Clés = clés de la table settings ; valeurs = image par défaut (repli si non défini).
 * Les composants publics lisent ces images via le store de config (ConfigHydrator).
 */
export const PAGE_IMAGE_DEFAULTS: Record<string, string> = {
  home_hero_1: "/banners/banner2-accueil.png",
  home_hero_2: "/banners/banner3-accuiel.png",
  home_hero_3: "/banners/banner4-accueil.png",
  home_banner_promo: "/banners/banner4-accueil.png",
  home_banner_nouveaute: "/banners/banner3-accuiel.png",
  banner_boutique: "/banners/banner2-accueil.png",
  banner_nouveautes: "/banners/banner3-accuiel.png",
  banner_promotions: "/banners/banner4-accueil.png",
  banner_panier: "/banners/banner2-accueil.png",
  gallery_1: "/categories/parfums.jpeg",
  gallery_2: "/categories/soins-visage.jpeg",
  gallery_3: "/categories/maquillage.jpeg",
  gallery_4: "/categories/soins-cheveux.jpeg",
  gallery_5: "/categories/cadeaux.jpeg",
};

/** Métadonnées d'affichage pour l'éditeur « Gestion des pages » (groupes + libellés). */
export const PAGE_IMAGE_GROUPS: { group: string; items: { key: string; label: string }[] }[] = [
  {
    group: "Accueil — bannières du slider",
    items: [
      { key: "home_hero_1", label: "Bannière 1" },
      { key: "home_hero_2", label: "Bannière 2" },
      { key: "home_hero_3", label: "Bannière 3" },
    ],
  },
  {
    group: "Accueil — bannières promotionnelles",
    items: [
      { key: "home_banner_promo", label: "Bannière « Offre spéciale »" },
      { key: "home_banner_nouveaute", label: "Bannière « Nouveautés »" },
    ],
  },
  {
    group: "Bannières des pages",
    items: [
      { key: "banner_boutique", label: "Page Boutique" },
      { key: "banner_nouveautes", label: "Page Nouveautés" },
      { key: "banner_promotions", label: "Page Promotions" },
      { key: "banner_panier", label: "Page Panier" },
    ],
  },
  {
    group: "Accueil — galerie (réseaux sociaux)",
    items: [
      { key: "gallery_1", label: "Photo 1" },
      { key: "gallery_2", label: "Photo 2" },
      { key: "gallery_3", label: "Photo 3" },
      { key: "gallery_4", label: "Photo 4" },
      { key: "gallery_5", label: "Photo 5" },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
] as const;
