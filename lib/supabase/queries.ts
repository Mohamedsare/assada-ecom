import { createClient } from "./server";
import type {
  Product, Category, Brand, Order, Profile, Address,
  Review, Payment, Coupon, ContactMessage,
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
  return (data ?? []) as Product[];
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
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}

// Admin queries — tous les statuts
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
  return (data ?? []) as Product[];
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

// ─── COUPONS (admin) ──────────────────────────────────────────────────────────

export async function getAdminCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { logError("getAdminCoupons", error); return []; }
  return (data ?? []) as Coupon[];
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

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");
  if (!data) return {};
  return Object.fromEntries(data.map((s: { key: string; value: unknown }) => [s.key, s.value]));
}
