import { createClient } from "./server";
import { DEFAULT_DELIVERY_FEE, DEFAULT_FREE_DELIVERY_THRESHOLD, DEFAULT_HERO_SLIDES, PAGE_IMAGE_DEFAULTS, type HeroSlide } from "@/lib/constants";
import type {
  Product, Category, Brand, Order, Profile, Address,
  Review, Payment, ContactMessage, DeliveryAgent,
} from "@/types";

function logError(fn: string, error: unknown) {
  const e = error as { message?: string; code?: string; details?: string; hint?: string };
  console.error(`[Supabase] ${fn} — code: ${e?.code ?? "?"}, message: ${e?.message ?? "unknown"}, details: ${e?.details ?? ""}`);
}

// ─── PRODUCTS ───────────────────────────────────────────────────────────────

export async function getProducts(options?: {
  category?: string;
  brand?: string;
  is_featured?: boolean;
  is_new?: boolean;
  is_promo?: boolean;
  limit?: number;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (options?.is_featured) query = query.eq("is_featured", true);
  if (options?.is_new) query = query.eq("is_new", true);
  if (options?.is_promo) query = query.eq("is_promo", true);
  if (options?.category) query = query.eq("categories.slug", options.category);
  if (options?.brand) query = query.eq("brands.slug", options.brand);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,short_description.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) { logError("getProducts", error); return []; }
  // Les coffrets (packs) ne s'affichent que sur leur page dédiée, jamais dans le catalogue.
  return (data ?? []).filter((p: Product) => !p.is_pack) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) { logError("getProductBySlug", error); return null; }
  return data as Product;
}

export async function getProductSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active");
  return (data ?? []).map((p: { slug: string }) => p.slug);
}

/** Données minimales des produits actifs pour le sitemap (slug + date de mise à jour). */
export async function getProductSitemapData(): Promise<{ slug: string; updated_at: string | null }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active");
  return (data ?? []) as { slug: string; updated_at: string | null }[];
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", productId)
    .limit(limit + 4);

  if (error) return [];
  return (data ?? []).filter((p: Product) => !p.is_pack).slice(0, limit) as Product[];
}

// Admin queries — tous les statuts (hors coffrets, gérés séparément)
export async function getAdminProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminProducts", error); return []; }
  return (data ?? []).filter((p: Product) => !p.is_pack) as Product[];
}

// ─── PACKS (coffrets cadeaux) ─────────────────────────────────────────────────

const PACK_ITEMS_SELECT = `
  pack_items:pack_items!pack_items_pack_id_fkey(
    id, pack_id, product_id, quantity, sort_order,
    product:products!pack_items_product_id_fkey(
      id, name, slug, main_image_url, current_price, status
    )
  )
`;

/** Packs publics (actifs) avec leurs produits composants, pour la page Coffrets cadeaux. */
export async function getPacks(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, category:categories(*), brand:brands(*), images:product_images(*), ${PACK_ITEMS_SELECT}`)
    .eq("is_pack", true)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) { logError("getPacks", error); return []; }
  return (data ?? []) as Product[];
}

/** Tous les packs (tous statuts) pour l'admin. */
export async function getAdminPacks(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, category:categories(*), images:product_images(*), ${PACK_ITEMS_SELECT}`)
    .eq("is_pack", true)
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminPacks", error); return []; }
  return (data ?? []) as Product[];
}

/** Un pack (tous statuts) par id — pour l'édition admin. */
export async function getAdminPackById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, category:categories(*), images:product_images(*), ${PACK_ITEMS_SELECT}`)
    .eq("id", id)
    .eq("is_pack", true)
    .single();

  if (error) { logError("getAdminPackById", error); return null; }
  return data as Product;
}

/** Un produit (tous statuts) par id — pour l'édition admin. */
export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(*),
      brand:brands(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq("id", id)
    .single();

  if (error) { logError("getAdminProductById", error); return null; }
  return data as Product;
}

// ─── CATEGORIES ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) { logError("getCategories", error); return []; }
  return (data ?? []) as Category[];
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) return [];
  return (data ?? []) as Category[];
}

/** Nombre de produits par catégorie (toutes statuts confondus) pour l'admin. */
export async function getProductCountByCategory(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("category_id");
  if (error) { logError("getProductCountByCategory", error); return {}; }
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { category_id: string | null }[]) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  return counts;
}

// ─── BRANDS ─────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) { logError("getBrands", error); return []; }
  return (data ?? []) as Brand[];
}

export async function getAllBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  if (error) return [];
  return (data ?? []) as Brand[];
}

/** Nombre de produits par marque (tous statuts) pour l'admin. */
export async function getProductCountByBrand(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("brand_id");
  if (error) { logError("getProductCountByBrand", error); return {}; }
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { brand_id: string | null }[]) {
    if (row.brand_id) counts[row.brand_id] = (counts[row.brand_id] ?? 0) + 1;
  }
  return counts;
}

// ─── ORDERS ─────────────────────────────────────────────────────────────────

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("order_number", orderNumber)
    .single();

  if (error) return null;
  return data as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) { logError("getUserOrders", error); return []; }
  return (data ?? []) as Order[];
}

export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, items:order_items(*)`)
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminOrders", error); return []; }
  return (data ?? []) as Order[];
}

/** Une commande complète (articles) pour le détail admin. */
export async function getAdminOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("id", id)
    .single();

  if (error) { logError("getAdminOrderById", error); return null; }
  return data as Order;
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getAdminProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Profile[];
}

/** Un profil par id — pour le détail client admin. */
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) { logError("getProfileById", error); return null; }
  return data as Profile;
}

/** Statistiques de commandes agrégées par client (nb de commandes + total dépensé). */
export async function getCustomerOrderStats(): Promise<Record<string, { count: number; total: number }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("user_id, total_amount, order_status");
  if (error) { logError("getCustomerOrderStats", error); return {}; }
  const stats: Record<string, { count: number; total: number }> = {};
  for (const o of (data ?? []) as { user_id: string | null; total_amount: number; order_status: string }[]) {
    if (!o.user_id) continue;
    if (!stats[o.user_id]) stats[o.user_id] = { count: 0, total: 0 };
    stats[o.user_id].count += 1;
    // On ne comptabilise que le CA réellement encaissé (commandes livrées)
    if (o.order_status === "delivered") stats[o.user_id].total += o.total_amount ?? 0;
  }
  return stats;
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export async function getUserAddresses(userId: string): Promise<Address[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) return [];
  return (data ?? []) as Address[];
}

// ─── WISHLIST ────────────────────────────────────────────────────────────────

export async function getUserWishlist(userId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(`
      product:products(
        *,
        category:categories(*),
        brand:brands(*),
        images:product_images(*),
        variants:product_variants(*)
      )
    `)
    .eq("user_id", userId);

  if (error) return [];
  return ((data ?? []).map((w: { product: unknown }) => w.product).filter(Boolean)) as Product[];
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();
  return !!data;
}

// ─── ADMIN STATS ─────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const supabase = await createClient();

  const [ordersRes, profilesRes, productsRes] = await Promise.all([
    supabase.from("orders").select("id, total_amount, order_status, created_at"),
    supabase.from("profiles").select("id, created_at").eq("role", "customer"),
    supabase.from("products").select("id, stock_quantity, status").lt("stock_quantity", 5),
  ]);

  const orders = ordersRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const lowStock = productsRes.data ?? [];

  const totalRevenue = orders
    .filter((o: { order_status: string }) => o.order_status === "delivered")
    .reduce((sum: number, o: { total_amount: number }) => sum + (o.total_amount ?? 0), 0);

  const pending = orders.filter((o: { order_status: string }) => o.order_status === "pending").length;
  const delivered = orders.filter((o: { order_status: string }) => o.order_status === "delivered").length;
  const cancelled = orders.filter((o: { order_status: string }) => o.order_status === "cancelled").length;
  const avgOrder = orders.length
    ? orders.reduce((sum: number, o: { total_amount: number }) => sum + (o.total_amount ?? 0), 0) / orders.length
    : 0;

  return {
    totalRevenue,
    totalOrders: orders.length,
    pendingOrders: pending,
    deliveredOrders: delivered,
    cancelledOrders: cancelled,
    totalCustomers: profiles.length,
    avgOrderValue: avgOrder,
    lowStockCount: lowStock.length,
  };
}

// ─── REVIEWS (admin) ──────────────────────────────────────────────────────────

export async function getAdminReviews(): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      product:products(id, name, slug, main_image_url),
      profile:profiles(first_name, last_name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminReviews", error); return []; }
  return (data ?? []) as Review[];
}

// ─── PAYMENTS (admin) ─────────────────────────────────────────────────────────

export async function getAdminPayments(): Promise<Payment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      order:orders(id, order_number, customer_name, order_status)
    `)
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminPayments", error); return []; }
  return (data ?? []) as Payment[];
}

// ─── CONTACT MESSAGES (admin) ─────────────────────────────────────────────────

export async function getAdminMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminMessages", error); return []; }
  return (data ?? []) as ContactMessage[];
}

// ─── DELIVERY AGENTS (livreurs) ───────────────────────────────────────────────

export async function getDeliveryAgents(): Promise<DeliveryAgent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delivery_agents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { logError("getDeliveryAgents", error); return []; }
  return (data ?? []) as DeliveryAgent[];
}

/** Stats par livreur : commandes assignées, livrées et montant encaissé (livrées). */
export async function getDeliveryAgentStats(): Promise<
  Record<string, { assigned: number; delivered: number; collected: number }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("delivery_agent_id, order_status, total_amount");
  if (error) { logError("getDeliveryAgentStats", error); return {}; }
  const stats: Record<string, { assigned: number; delivered: number; collected: number }> = {};
  for (const o of (data ?? []) as { delivery_agent_id: string | null; order_status: string; total_amount: number }[]) {
    if (!o.delivery_agent_id) continue;
    if (!stats[o.delivery_agent_id]) stats[o.delivery_agent_id] = { assigned: 0, delivered: 0, collected: 0 };
    stats[o.delivery_agent_id].assigned += 1;
    if (o.order_status === "delivered") {
      stats[o.delivery_agent_id].delivered += 1;
      stats[o.delivery_agent_id].collected += o.total_amount ?? 0;
    }
  }
  return stats;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  if (!data) return {};
  return Object.fromEntries(data.map((s: { key: string; value: unknown }) => [s.key, s.value]));
}

/** Décode une valeur de réglage potentiellement encodée en JSON, puis en nombre. */
function readSettingNumber(raw: unknown, fallback: number): number {
  if (raw == null) return fallback;
  let v = raw;
  if (typeof v === "string") {
    try { const parsed = JSON.parse(v); v = parsed; } catch { /* valeur brute */ }
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Configuration boutique consommée par le panier / checkout (frais de livraison,
 * seuil de gratuité). Lit les Paramètres en base avec repli sur les constantes.
 */
export async function getStoreConfig(): Promise<{ deliveryFee: number; freeDeliveryThreshold: number }> {
  const s = await getSettings();
  return {
    deliveryFee: readSettingNumber(s.delivery_fee, DEFAULT_DELIVERY_FEE),
    freeDeliveryThreshold: readSettingNumber(s.free_delivery_threshold, DEFAULT_FREE_DELIVERY_THRESHOLD),
  };
}

/** Décode une valeur de réglage texte (potentiellement encodée en JSON). */
function readSettingString(raw: unknown): string {
  if (raw == null) return "";
  let v: unknown = raw;
  if (typeof v === "string") { try { v = JSON.parse(v); } catch { /* valeur brute */ } }
  return typeof v === "string" ? v : "";
}

/**
 * Images éditables du site (page « Gestion des pages »). Ne renvoie que les clés
 * réellement définies en base (non vides) ; le reste utilise les défauts côté client.
 */
export async function getPageImages(): Promise<Record<string, string>> {
  const s = await getSettings();
  const out: Record<string, string> = {};
  for (const key of Object.keys(PAGE_IMAGE_DEFAULTS)) {
    const v = readSettingString(s[key]).trim();
    if (v) out[key] = v;
  }
  return out;
}

/**
 * Slides du slider d'accueil (images ou vidéos), gérés dans « Gestion des pages ».
 * Renvoie les slides par défaut si le réglage `hero_slides` est absent ou invalide.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const s = await getSettings();
  let raw: unknown = s.hero_slides;
  if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = null; } }
  if (!Array.isArray(raw)) return DEFAULT_HERO_SLIDES;
  const slides = raw
    .filter((v): v is HeroSlide =>
      !!v && typeof v === "object" &&
      typeof (v as HeroSlide).url === "string" && (v as HeroSlide).url.trim() !== "" &&
      ((v as HeroSlide).type === "image" || (v as HeroSlide).type === "video"),
    )
    .map((v) => {
      const slide: HeroSlide = { type: v.type, url: v.url.trim() };
      if (typeof v.title === "string" && v.title.trim()) slide.title = v.title.trim();
      if (typeof v.link === "string" && v.link.trim()) slide.link = v.link.trim();
      return slide;
    });
  return slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
}
