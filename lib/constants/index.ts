export const SITE_NAME = "RYTA";

/** Valeurs de livraison par défaut (surchargées par les Paramètres boutique en base). */
export const DEFAULT_DELIVERY_FEE = 30;
export const DEFAULT_FREE_DELIVERY_THRESHOLD = 300;

export const SITE_EMAIL = "contact@ryta.ma";
export const SITE_PHONE = "+212 654 885 746";
export const WHATSAPP_NUMBER = "212654885746";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ryta.ma";

export const SITE_DESCRIPTION =
  "RYTA, votre boutique en ligne à Casablanca : produits de beauté (parfums, maquillage, soins du visage, du corps et des cheveux), compléments alimentaires et produits du terroir marocain (miel, huiles, amlou, épices, dattes). Livraison partout au Maroc en 24 à 72h, gratuite à partir de 300 DH. Paiement à la livraison. Boutique physique à Derb Ghalef, Casablanca. Support WhatsApp.";

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

/** Mots-clés SEO Casablanca — les 3 axes RYTA + intentions d'achat locales. */
export const SEO_KEYWORDS = [
  "boutique en ligne Casablanca", "produits de beauté Casablanca", "parfums Casablanca",
  "cosmétique Derb Ghalef", "maquillage Casablanca", "soins visage Casablanca",
  "compléments alimentaires Casablanca", "compléments alimentaires Maroc",
  "produits du terroir marocain", "produits locaux marocains",
  "miel Maroc", "amlou", "huile d'argan Casablanca",
  "livraison Casablanca", "paiement à la livraison Casablanca", "RYTA Casablanca", "RYTA",
] as const;

/**
 * Les 3 grands axes de la boutique (catégories de tête, parent_id = null en base).
 * Utilisé pour la map emoji des catégories de tête (accueil/nouveautés), la 404 et le sitemap.
 * Miroir de supabase-categories-axes.sql.
 */
export const CATEGORIES = [
  { name: "Beauté et bien-être", slug: "beaute", emoji: "💄" },
  { name: "Compléments alimentaires", slug: "complements-alimentaires", emoji: "💊" },
  { name: "Produits du terroir", slug: "produits-locaux", emoji: "🫒" },
] as const;

/**
 * Arborescence de navigation (méga-menu desktop + accordéon mobile).
 * Miroir curé de la taxonomie seedée en base :
 *   - axes + sous-catégories → supabase-categories-axes.sql
 *   - feuilles de l'axe Beauté (ex. parfums-homme) → supabase-schema.sql
 * Les liens pointent vers /boutique?categorie=<slug>.
 */
export type CategoryLeaf = { name: string; slug: string };
export type CategoryNode = { name: string; slug: string; children?: CategoryLeaf[] };
export type Axis = { name: string; slug: string; emoji: string; children: CategoryNode[] };

export const AXES: Axis[] = [
  {
    name: "Beauté et bien-être", slug: "beaute", emoji: "💄",
    children: [
      {
        name: "Parfums", slug: "parfums",
        children: [
          { name: "Homme", slug: "parfums-homme" },
          { name: "Enfant", slug: "parfums-enfant" },
          { name: "Luxe", slug: "parfums-luxe" },
          { name: "Niche", slug: "parfums-niche" },
          { name: "Coffrets", slug: "parfums-coffrets" },
        ],
      },
      {
        name: "Soins du visage", slug: "soins-visage",
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
        name: "Soins du corps", slug: "soins-corps",
        children: [
          { name: "Laits & crèmes", slug: "soins-corps-laits-cremes" },
          { name: "Huiles", slug: "soins-corps-huiles" },
          { name: "Gommages", slug: "soins-corps-gommages" },
          { name: "Déodorants", slug: "soins-corps-deodorants" },
          { name: "Savons", slug: "soins-corps-savons" },
        ],
      },
      {
        name: "Soins des cheveux", slug: "soins-cheveux",
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
        name: "Maquillage", slug: "maquillage",
        children: [
          { name: "Teint", slug: "maquillage-teint" },
          { name: "Yeux", slug: "maquillage-yeux" },
          { name: "Lèvres", slug: "maquillage-levres" },
          { name: "Ongles", slug: "maquillage-ongles" },
        ],
      },
      {
        name: "Hygiène", slug: "hygiene",
        children: [
          { name: "Gel douche", slug: "hygiene-gel-douche" },
          { name: "Hygiène intime", slug: "hygiene-intime" },
          { name: "Hygiène bucco-dentaire", slug: "hygiene-bucco-dentaire" },
          { name: "Désinfectants", slug: "hygiene-desinfectants" },
        ],
      },
      { name: "Traditionnels / Hammam", slug: "traditionnels-hammam" },
      {
        name: "Accessoires beauté", slug: "accessoires",
        children: [
          { name: "Trousses", slug: "accessoires-trousses" },
          { name: "Vaporisateurs", slug: "accessoires-vaporisateurs" },
          { name: "Pinceaux", slug: "accessoires-pinceaux" },
          { name: "Miroirs", slug: "accessoires-miroirs" },
          { name: "Éponges", slug: "accessoires-eponges" },
        ],
      },
      {
        name: "Coffrets & cadeaux", slug: "cadeaux",
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
        name: "Bien-être", slug: "bien-etre",
        children: [
          { name: "Aromathérapie", slug: "bien-etre-aromatherapie" },
          { name: "Aérothérapie", slug: "bien-etre-aerotherapie" },
          { name: "Phytothérapie", slug: "bien-etre-phytotherapie" },
          { name: "Neurothérapie", slug: "bien-etre-neurotherapie" },
          { name: "Psychothérapie & relaxation", slug: "bien-etre-psychotherapie" },
        ],
      },
    ],
  },
  {
    name: "Compléments alimentaires", slug: "complements-alimentaires", emoji: "💊",
    children: [
      { name: "Beauté (peau, cheveux, ongles)", slug: "complements-beaute" },
      { name: "Vitalité & énergie", slug: "complements-vitalite-energie" },
      { name: "Immunité & défenses", slug: "complements-immunite" },
      { name: "Minceur & détox", slug: "complements-minceur-detox" },
      { name: "Digestion & transit", slug: "complements-digestion" },
      { name: "Sommeil & stress", slug: "complements-sommeil-stress" },
      { name: "Articulations & os", slug: "complements-articulations-os" },
      { name: "Cheveux & ongles", slug: "complements-cheveux-ongles" },
      { name: "Femme / Homme", slug: "complements-femme-homme" },
    ],
  },
  {
    name: "Produits du terroir", slug: "produits-locaux", emoji: "🫒",
    children: [
      { name: "Miels", slug: "miels" },
      { name: "Huiles alimentaires", slug: "huiles-alimentaires" },
      { name: "Amlou & pâtes à tartiner", slug: "amlou-pates-a-tartiner" },
      { name: "Épices & aromates", slug: "epices-aromates" },
      { name: "Fruits secs & dattes", slug: "fruits-secs-dattes" },
      { name: "Olives & conserves", slug: "olives-conserves" },
      { name: "Confitures & sirops", slug: "confitures-sirops" },
      { name: "Thés & infusions", slug: "thes-infusions" },
      { name: "Eaux florales & hydrolats", slug: "eaux-florales-hydrolats" },
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
  home_banner_promo: "/banners/banner4-accueil.png",
  home_banner_nouveaute: "/banners/banner3-accuiel.png",
  // Cartes « Offres » de la page d'accueil (fond des deux bannières)
  offer_coffrets: "/categories/cadeaux.jpeg",
  offer_promotions: "/banners/banner4-accueil.png",
  banner_boutique: "/banners/banner2-accueil.png",
  banner_nouveautes: "/banners/banner3-accuiel.png",
  banner_promotions: "/banners/banner4-accueil.png",
  banner_panier: "/banners/banner2-accueil.png",
  gallery_1: "/categories/parfums.jpeg",
  gallery_2: "/categories/soins-visage.jpeg",
  gallery_3: "/categories/maquillage.jpeg",
  gallery_4: "/categories/soins-cheveux.jpeg",
  gallery_5: "/categories/cadeaux.jpeg",
  // Images des méga-menus de navigation (« Images liens »)
  menu_univers_1: "/banners/banner2-accueil.png",
  menu_univers_2: "/banners/banner4-accueil.png",
  menu_complements_1: "/banners/banner3-accuiel.png",
  menu_complements_2: "/banners/banner2-accueil.png",
  menu_locaux_1: "/banners/banner2-accueil.png",
  menu_locaux_2: "/banners/banner4-accueil.png",
};

/**
 * Un slide de la bannière d'accueil : image ou vidéo en arrière-plan.
 * La liste est entièrement gérée en admin (« Gestion des pages » → slider) et
 * stockée dans le réglage `hero_slides`.
 */
export type HeroSlideType = "image" | "video";
export interface HeroSlide {
  type: HeroSlideType;
  url: string;
  /** Grand titre affiché par-dessus la bannière (optionnel — vide = bannière épurée). */
  title?: string;
  /** Destination du bouton « Découvrir » (optionnel — défaut : /boutique). */
  link?: string;
}

/** Slides par défaut du slider d'accueil (repli si aucun slide n'est configuré en admin). */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { type: "image", url: "/banners/banner2-accueil.png" },
  { type: "image", url: "/banners/banner3-accuiel.png" },
  { type: "image", url: "/banners/banner4-accueil.png" },
  { type: "image", url: "/banners/b1.png" },
  { type: "image", url: "/banners/b2.png" },
  { type: "image", url: "/banners/b3.png" },
];

/** Métadonnées d'affichage pour l'éditeur « Gestion des pages » (groupes + libellés). */
export const PAGE_IMAGE_GROUPS: { group: string; items: { key: string; label: string }[] }[] = [
  {
    group: "Accueil — bannières promotionnelles",
    items: [
      { key: "home_banner_promo", label: "Bannière « Offre spéciale »" },
      { key: "home_banner_nouveaute", label: "Bannière « Nouveautés »" },
    ],
  },
  {
    group: "Accueil — cartes « Offres »",
    items: [
      { key: "offer_coffrets", label: "Carte « Coffrets cadeaux » (fond)" },
      { key: "offer_promotions", label: "Carte « Promotions » (fond)" },
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
  {
    group: "Images liens (méga-menus de navigation)",
    items: [
      { key: "menu_univers_1", label: "L'univers RYTA — image 1" },
      { key: "menu_univers_2", label: "L'univers RYTA — image 2" },
      { key: "menu_complements_1", label: "Compléments alimentaires — image 1" },
      { key: "menu_complements_2", label: "Compléments alimentaires — image 2" },
      { key: "menu_locaux_1", label: "Produits locaux — image 1" },
      { key: "menu_locaux_2", label: "Produits locaux — image 2" },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
] as const;

/** Sous-menu « L'univers RYTA » du header (liens institutionnels). */
export const UNIVERS_LINKS = [
  { label: "Magasin", href: "/boutique" },
  { label: "Qui sommes-nous ?", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Visuels affichés dans les méga-menus de navigation (desktop + mobile).
 * `imageKey` = clé éditable dans l'admin « Gestion des pages » → « Images liens ».
 * `fallback` = image de secours tant qu'aucune image n'est définie.
 */
export type MenuFeatured = { href: string; caption: string; imageKey: string; fallback: string };

/** Deux visuels du méga-menu « L'univers RYTA ». */
export const UNIVERS_FEATURED: MenuFeatured[] = [
  { href: "/boutique?categorie=produits-locaux", caption: "Produits du terroir", imageKey: "menu_univers_1", fallback: "/banners/banner2-accueil.png" },
  { href: "/boutique?categorie=beaute",          caption: "Beauté & soins",      imageKey: "menu_univers_2", fallback: "/banners/banner4-accueil.png" },
];

/** Visuels par axe (clé = slug de l'axe). Les axes absents n'affichent pas d'images. */
export const AXIS_FEATURED: Record<string, MenuFeatured[]> = {
  "complements-alimentaires": [
    { href: "/boutique?categorie=complements-vitalite-energie", caption: "Vitalité & énergie", imageKey: "menu_complements_1", fallback: "/banners/banner3-accuiel.png" },
    { href: "/boutique?categorie=complements-minceur-detox",    caption: "Minceur & détox",    imageKey: "menu_complements_2", fallback: "/banners/banner2-accueil.png" },
  ],
  "produits-locaux": [
    { href: "/boutique?categorie=miels",              caption: "Miels du terroir", imageKey: "menu_locaux_1", fallback: "/banners/banner2-accueil.png" },
    { href: "/boutique?categorie=huiles-alimentaires", caption: "Huiles & olives",  imageKey: "menu_locaux_2", fallback: "/banners/banner4-accueil.png" },
  ],
};
