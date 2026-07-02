"use server";

import { createClient } from "./server";
import { createAdminClient } from "./admin";
import { getCurrentProfile } from "./queries";
import { ensurePermission, ensureSensitive } from "./guards";
import { isFullAccessRole, defaultEmployeePermissions } from "@/lib/permissions";
import { PAGE_IMAGE_DEFAULTS } from "@/lib/constants";
import type { PermissionMatrix } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name, phone },
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signInWithGoogle(formData?: FormData) {
  const supabase = await createClient();

  // On dérive l'origine de la requête courante : fonctionne aussi bien en local
  // qu'en production sans dépendre d'une variable d'env mal configurée.
  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  // Destination finale après connexion (ex : la page d'où vient l'utilisateur)
  const next = (formData?.get("redirect") as string) || "/compte";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      // access_type=offline + prompt=consent garantit l'obtention d'un refresh token
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const updates: Record<string, unknown> = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    updated_at: new Date().toISOString(),
  };
  // N'écrase l'avatar que si le champ est présent dans le formulaire (page profil admin)
  if (formData.has("avatar_url")) {
    updates.avatar_url = (formData.get("avatar_url") as string) || null;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/compte");
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: true };
}

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export async function createAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const is_default = formData.get("is_default") === "true";

  if (is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    district: formData.get("district"),
    address_details: formData.get("address_details"),
    landmark: formData.get("landmark"),
    is_default,
  });

  if (error) return { error: error.message };
  revalidatePath("/compte/adresses");
  return { success: true };
}

export async function updateAddress(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const is_default = formData.get("is_default") === "true";
  if (is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").update({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    district: formData.get("district"),
    address_details: formData.get("address_details"),
    landmark: formData.get("landmark"),
    is_default,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/compte/adresses");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/compte/adresses");
  return { success: true };
}

// ─── WISHLIST ────────────────────────────────────────────────────────────────

export async function toggleWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
    revalidatePath("/compte/favoris");
    return { added: false };
  } else {
    await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
    revalidatePath("/compte/favoris");
    return { added: true };
  }
}

export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  revalidatePath("/compte/favoris");
  return { success: true };
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  customer: { first_name: string; last_name: string; phone: string; email?: string };
  address: { city: string; district: string; address_details?: string; landmark?: string };
  payment: { method: string; payment_phone: string };
  items: {
    product_id: string;
    variant_id?: string;
    product_name: string;
    product_image_url?: string;
    color?: string;
    size?: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  discount?: number;
  coupon_code?: string | null;
}) {
  // On lit l'éventuelle session via le client standard (pour rattacher la commande
  // à un compte s'il est connecté), mais TOUTES les écritures passent par le client
  // service_role : la commande invité (user_id null) ne dépend ainsi d'aucune règle
  // RLS et fonctionne de façon garantie, sans compte ni connexion.
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Configuration serveur incomplète. Réessayez plus tard ou contactez-nous sur WhatsApp." };
  }

  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  const order_number = `ASSADA-${year}-${random}`;

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 2);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      order_number,
      customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
      customer_email: data.customer.email || null,
      customer_phone: data.customer.phone,
      delivery_city: data.address.city,
      delivery_district: data.address.district,
      delivery_address_details: data.address.address_details || null,
      delivery_landmark: data.address.landmark || null,
      payment_method: data.payment.method,
      payment_status: "pending",
      order_status: "pending",
      subtotal: data.subtotal,
      delivery_fee: data.delivery_fee,
      discount_amount: data.discount ?? 0,
      total_amount: data.total,
      estimated_delivery_date: estimatedDate.toISOString().split("T")[0],
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id ?? null,
    product_name: item.product_name,
    product_image_url: item.product_image_url ?? null,
    color: item.color ?? null,
    size: item.size ?? null,
    unit_price: item.unit_price,
    quantity: item.quantity,
    total_price: item.total_price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) return { error: itemsError.message };

  // Enregistrer le paiement
  await supabase.from("payments").insert({
    order_id: order.id,
    method: data.payment.method,
    status: data.payment.method === "cash_on_delivery" ? "cash_on_delivery" : "pending",
    amount: data.total,
    reference: data.payment.payment_phone || null,
  });

  // Incrémente l'usage du coupon si présent (via fonction SQL security definer,
  // car l'écriture sur coupons est protégée par RLS côté client). Échec silencieux.
  if (data.coupon_code) {
    try { await supabase.rpc("increment_coupon_usage", { p_code: data.coupon_code }); }
    catch { /* fonction non déployée ou usage non suivi : sans impact sur la commande */ }
  }

  return { success: true, order_number };
}

/**
 * Récupère une commande par son numéro pour la page de confirmation / suivi.
 * Passe par le client service_role afin que la commande invité (user_id null)
 * soit lisible sans compte ni connexion, indépendamment des règles RLS.
 * On ne renvoie que des champs publics (jamais admin_note).
 */
export async function getOrderByNumber(orderNumber: string) {
  const number = orderNumber?.trim().toUpperCase();
  if (!number) return { error: "Numéro de commande manquant." };

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Configuration serveur incomplète." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `order_number, order_status, payment_method, payment_status,
       customer_name, customer_email, customer_phone,
       delivery_city, delivery_district, delivery_address_details,
       subtotal, delivery_fee, discount_amount, total_amount,
       estimated_delivery_date, created_at,
       items:order_items(*)`,
    )
    .eq("order_number", number)
    .maybeSingle();

  if (error || !data) return { error: "Commande introuvable." };
  return { order: data };
}

// ─── ADMIN — PRODUCTS ────────────────────────────────────────────────────────

/** Récupère jusqu'à 5 URLs d'images depuis le FormData (champs "images"). */
function readProductImages(formData: FormData): string[] {
  return formData.getAll("images").map((v) => String(v)).filter(Boolean).slice(0, 5);
}

interface VariantInput {
  color: string | null;
  size: string | null;
  stock_quantity: number;
  price_adjustment: number;
}

/**
 * Lit les variantes depuis le champ JSON "variants" du formulaire.
 * Ignore les lignes totalement vides (ni couleur ni taille).
 */
function readProductVariants(formData: FormData): VariantInput[] {
  const raw = formData.get("variants");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw)) as Array<{
      color?: string; size?: string; stock_quantity?: number | string; price_adjustment?: number | string;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => ({
        color: v.color?.trim() || null,
        size: v.size?.trim() || null,
        stock_quantity: Math.max(0, Math.floor(Number(v.stock_quantity) || 0)),
        price_adjustment: Math.floor(Number(v.price_adjustment) || 0),
      }))
      .filter((v) => v.color || v.size);
  } catch {
    return [];
  }
}

export async function adminCreateProduct(formData: FormData) {
  const gate = await ensurePermission("products", "create");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const images = readProductImages(formData);
  const mainImage = images[0] || (formData.get("main_image_url") as string) || null;

  const { data, error } = await supabase.from("products").insert({
    name,
    slug,
    category_id: formData.get("category_id") || null,
    brand_id: formData.get("brand_id") || null,
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    current_price: Number(formData.get("current_price")),
    old_price: formData.get("old_price") ? Number(formData.get("old_price")) : null,
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    sku: formData.get("sku") || null,
    main_image_url: mainImage,
    video_url: formData.get("video_url") || null,
    is_featured: formData.get("is_featured") === "true",
    is_new: formData.get("is_new") === "true",
    is_promo: formData.get("is_promo") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  }).select().single();

  if (error) return { error: error.message };

  if (images.length) {
    await supabase.from("product_images").insert(
      images.map((url, i) => ({ product_id: data.id, image_url: url, sort_order: i, alt_text: name })),
    );
  }

  const variants = readProductVariants(formData);
  if (variants.length) {
    await supabase.from("product_variants").insert(
      variants.map((v) => ({ ...v, product_id: data.id })),
    );
  }

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true, product: data };
}

export async function adminUpdateProduct(id: string, formData: FormData) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const images = readProductImages(formData);
  const mainImage = images[0] || (formData.get("main_image_url") as string) || null;

  const { error } = await supabase.from("products").update({
    name: formData.get("name"),
    category_id: formData.get("category_id") || null,
    brand_id: formData.get("brand_id") || null,
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    current_price: Number(formData.get("current_price")),
    old_price: formData.get("old_price") ? Number(formData.get("old_price")) : null,
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    sku: formData.get("sku") || null,
    main_image_url: mainImage,
    video_url: formData.get("video_url") || null,
    is_featured: formData.get("is_featured") === "true",
    is_new: formData.get("is_new") === "true",
    is_promo: formData.get("is_promo") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };

  // Resynchronise la galerie : on remplace l'ensemble des photos
  await supabase.from("product_images").delete().eq("product_id", id);
  if (images.length) {
    await supabase.from("product_images").insert(
      images.map((url, i) => ({ product_id: id, image_url: url, sort_order: i, alt_text: formData.get("name") })),
    );
  }

  // Resynchronise les variantes (les commandes/paniers conservent leur snapshot via ON DELETE SET NULL)
  await supabase.from("product_variants").delete().eq("product_id", id);
  const variants = readProductVariants(formData);
  if (variants.length) {
    await supabase.from("product_variants").insert(
      variants.map((v) => ({ ...v, product_id: id })),
    );
  }

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  revalidatePath(`/admin/produits/${id}/modifier`);
  return { success: true };
}

export async function adminDeleteProduct(id: string) {
  const gate = await ensurePermission("products", "delete");
  if (!gate.ok) throw new Error(gate.error);
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
}

export async function adminToggleProductStatus(id: string, status: string) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/produits");
  return { success: true };
}

// ─── ADMIN — CATEGORIES ───────────────────────────────────────────────────────

export async function adminCreateCategory(formData: FormData) {
  const gate = await ensurePermission("categories", "create");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: formData.get("description") || null,
    image_url: formData.get("image_url") || null,
    parent_id: formData.get("parent_id") || null,
    is_active: formData.get("is_active") !== "false",
    sort_order: Number(formData.get("sort_order") ?? 0),
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function adminUpdateCategory(id: string, formData: FormData) {
  const gate = await ensurePermission("categories", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({
    name: formData.get("name"),
    description: formData.get("description") || null,
    image_url: formData.get("image_url") || null,
    parent_id: formData.get("parent_id") || null,
    is_active: formData.get("is_active") !== "false",
    sort_order: Number(formData.get("sort_order") ?? 0),
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function adminToggleCategoryActive(id: string, is_active: boolean) {
  const gate = await ensurePermission("categories", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("categories")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidatePath("/boutique");
  return { success: true };
}

export async function adminDeleteCategory(id: string) {
  const gate = await ensurePermission("categories", "delete");
  if (!gate.ok) throw new Error(gate.error);
  const supabase = await createClient();

  // Empêche la suppression d'une catégorie contenant des produits ou des sous-catégories.
  const [{ count: productCount }, { count: childCount }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id),
  ]);

  if ((productCount ?? 0) > 0)
    throw new Error(`Impossible de supprimer : ${productCount} produit(s) rattaché(s) à cette catégorie.`);
  if ((childCount ?? 0) > 0)
    throw new Error(`Impossible de supprimer : ${childCount} sous-catégorie(s) rattachée(s).`);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/boutique");
}

// ─── ADMIN — BRANDS ──────────────────────────────────────────────────────────

export async function adminCreateBrand(formData: FormData) {
  const gate = await ensurePermission("brands", "create");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { error } = await supabase.from("brands").insert({
    name,
    slug,
    logo_url: formData.get("logo_url") || null,
    description: formData.get("description") || null,
    is_active: formData.get("is_active") !== "false",
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/marques");
  return { success: true };
}

export async function adminUpdateBrand(id: string, formData: FormData) {
  const gate = await ensurePermission("brands", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("brands").update({
    name: formData.get("name"),
    logo_url: formData.get("logo_url") || null,
    description: formData.get("description") || null,
    is_active: formData.get("is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/marques");
  return { success: true };
}

export async function adminToggleBrandActive(id: string, is_active: boolean) {
  const gate = await ensurePermission("brands", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("brands")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/marques");
  revalidatePath("/boutique");
  return { success: true };
}

export async function adminDeleteBrand(id: string) {
  const gate = await ensurePermission("brands", "delete");
  if (!gate.ok) throw new Error(gate.error);
  const supabase = await createClient();

  // Empêche la suppression d'une marque rattachée à des produits (évite l'orphelinage silencieux).
  const { count } = await supabase
    .from("products").select("id", { count: "exact", head: true }).eq("brand_id", id);
  if ((count ?? 0) > 0)
    throw new Error(`Impossible de supprimer : ${count} produit(s) rattaché(s) à cette marque.`);

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marques");
  revalidatePath("/boutique");
}

// ─── ADMIN — ORDERS ───────────────────────────────────────────────────────────

export async function adminUpdateOrderStatus(id: string, status: string) {
  // Annulation & passage en « livrée » = permissions sensibles ; sinon édition commande.
  const gate =
    status === "cancelled" ? await ensureSensitive("cancel_order")
    : status === "delivered" ? await ensureSensitive("mark_delivered")
    : await ensurePermission("orders", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const { error } = await supabase.from("orders").update({
    order_status: status,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/livraisons");
  return { success: true };
}

export async function adminUpdatePaymentStatus(id: string, status: string) {
  const gate = await ensurePermission("orders", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({
    payment_status: status,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };

  // Synchronise la ligne de paiement liée si elle existe
  await supabase.from("payments")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("order_id", id);

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/paiements");
  return { success: true };
}

export async function adminUpdateOrderNote(id: string, note: string) {
  const gate = await ensurePermission("orders", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({
    admin_note: note || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/commandes/${id}`);
  return { success: true };
}

// ─── ADMIN — SETTINGS ────────────────────────────────────────────────────────

export async function adminUpdateSettings(formData: FormData) {
  const gate = await ensurePermission("settings", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const keys = [
    "shop_name", "shop_email", "shop_phone", "shop_whatsapp",
    "shop_address", "shop_city", "delivery_fee", "free_delivery_threshold",
    "facebook_url", "tiktok_url", "instagram_url",
    "invoice_format", "invoice_footer",
  ];

  const upserts = keys.map((key) => ({
    key,
    value: formData.get(key) !== null ? JSON.stringify(formData.get(key)) : null,
  })).filter((u) => u.value !== null);

  for (const u of upserts) {
    await supabase.from("settings").upsert({ key: u.key, value: u.value }, { onConflict: "key" });
  }

  revalidatePath("/admin/parametres");
  return { success: true };
}

// ─── ADMIN — GESTION DES PAGES (images éditables) ─────────────────────────────

/** Met à jour les images éditables du site (bannières hero, bannières de pages). Réservé aux admins. */
export async function adminUpdatePageImages(formData: FormData) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };

  const supabase = await createClient();
  for (const key of Object.keys(PAGE_IMAGE_DEFAULTS)) {
    const value = ((formData.get(key) as string) ?? "").trim();
    // Valeur vide = on revient à l'image par défaut (getPageImages ignore les vides).
    await supabase.from("settings").upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" });
  }

  revalidatePath("/", "layout");   // rafraîchit les bannières publiques
  revalidatePath("/admin/reglages");
  return { success: true };
}

// ─── ADMIN — REVIEWS ──────────────────────────────────────────────────────────

export async function adminUpdateReviewApproval(id: string, is_approved: boolean) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/avis");
  return { success: true };
}

export async function adminDeleteReview(id: string) {
  const gate = await ensurePermission("products", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/avis");
  return { success: true };
}

// ─── ADMIN — PAYMENTS (table) ─────────────────────────────────────────────────

export async function adminUpdatePayment(id: string, status: string) {
  const gate = await ensurePermission("orders", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("id", id)
    .select("order_id")
    .single();

  if (error) return { error: error.message };

  // Synchronise le statut de paiement de la commande liée
  if (payment?.order_id) {
    await supabase.from("orders")
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq("id", payment.order_id);
  }

  revalidatePath("/admin/paiements");
  revalidatePath("/admin/commandes");
  return { success: true };
}

// ─── ADMIN — STOCK ────────────────────────────────────────────────────────────

export async function adminUpdateStock(id: string, stock_quantity: number) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const qty = Math.max(0, Math.floor(stock_quantity));

  // On ne touche au statut que pour la transition stock ↔ rupture :
  // un produit en brouillon ou masqué ne doit pas être publié par un simple réassort.
  const { data: current } = await supabase
    .from("products").select("status").eq("id", id).single();

  let status = current?.status as string | undefined;
  if (qty === 0) status = "out_of_stock";
  else if (status === "out_of_stock") status = "active";

  const { error } = await supabase.from("products")
    .update({
      stock_quantity: qty,
      ...(status ? { status } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/stocks");
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true };
}

// ─── ADMIN — USERS (rôles) ────────────────────────────────────────────────────

export async function adminUpdateUserRole(id: string, role: string) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/clients");
  return { success: true };
}

export async function adminToggleUserActive(id: string, is_active: boolean) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/clients");
  return { success: true };
}

// ─── ADMIN — MESSAGES ─────────────────────────────────────────────────────────

export async function adminMarkMessageRead(id: string, is_read: boolean) {
  const gate = await ensurePermission("clients", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function adminDeleteMessage(id: string) {
  const gate = await ensurePermission("clients", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
  return { success: true };
}

// ─── ADMIN — LIVREURS (delivery agents) ───────────────────────────────────────

export async function adminCreateDeliveryAgent(formData: FormData) {
  const gate = await ensurePermission("delivery", "create");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_agents").insert({
    name: (formData.get("name") as string)?.trim(),
    phone: (formData.get("phone") as string)?.trim(),
    zones: ((formData.get("zones") as string) ?? "").trim() || null,
    note: ((formData.get("note") as string) ?? "").trim() || null,
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminUpdateDeliveryAgent(id: string, formData: FormData) {
  const gate = await ensurePermission("delivery", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_agents").update({
    name: (formData.get("name") as string)?.trim(),
    phone: (formData.get("phone") as string)?.trim(),
    zones: ((formData.get("zones") as string) ?? "").trim() || null,
    note: ((formData.get("note") as string) ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminToggleDeliveryAgentActive(id: string, is_active: boolean) {
  const gate = await ensurePermission("delivery", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_agents")
    .update({ is_active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminDeleteDeliveryAgent(id: string) {
  const gate = await ensurePermission("delivery", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_agents").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminAssignOrderAgent(orderId: string, agentId: string) {
  const gate = await ensurePermission("delivery", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("orders")
    .update({ delivery_agent_id: agentId || null, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/commandes/${orderId}`);
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminUpdateOrderChannel(orderId: string, channel: string) {
  const gate = await ensurePermission("orders", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("orders")
    .update({ channel, updated_at: new Date().toISOString() }).eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/commandes/${orderId}`);
  return { success: true };
}

// ─── ADMIN — PERMISSIONS (employés) ────────────────────────────────────────────

/**
 * Crée directement un compte employé (email + mot de passe) via la clé service_role.
 * Réservé aux admins/super_admins. Le trigger SQL crée la ligne profiles, qu'on
 * complète ensuite avec le rôle « employee » et des permissions par défaut.
 */
export async function adminCreateEmployee(formData: FormData) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };

  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const first_name = ((formData.get("first_name") as string) ?? "").trim() || null;
  const last_name = ((formData.get("last_name") as string) ?? "").trim() || null;
  const phone = ((formData.get("phone") as string) ?? "").trim() || null;

  if (!email) return { error: "L'email est requis." };
  if (password.length < 6) return { error: "Le mot de passe doit contenir au moins 6 caractères." };

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // compte utilisable immédiatement, sans email de confirmation
    user_metadata: { first_name, last_name },
  });
  if (error) {
    return { error: error.message.includes("already been registered")
      ? "Un compte existe déjà avec cet email."
      : error.message };
  }

  const userId = data.user?.id;
  if (!userId) return { error: "La création du compte a échoué." };

  const { error: upErr } = await admin.from("profiles").update({
    role: "employee",
    first_name,
    last_name,
    phone,
    permissions: defaultEmployeePermissions(),
    updated_at: new Date().toISOString(),
  }).eq("id", userId);
  if (upErr) return { error: upErr.message };

  revalidatePath("/admin/permissions");
  return { success: true };
}

/** Met à jour la matrice de permissions d'un employé. Réservé aux admins. */
export async function adminUpdateEmployeePermissions(userId: string, permissions: PermissionMatrix) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles")
    .update({ permissions, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/permissions");
  return { success: true };
}

// ─── ADMIN — RECHERCHE GLOBALE ────────────────────────────────────────────────

/**
 * Recherche transverse (produits, commandes, clients) pour la barre de recherche admin.
 * Réservée au staff ; renvoie des résultats groupés et limités.
 */
export async function adminSearch(query: string) {
  const q = query.trim();
  const empty = { products: [], orders: [], clients: [] };

  const current = await getCurrentProfile();
  const isStaff = !!current && (isFullAccessRole(current.role) || current.role === "employee");
  if (!isStaff || q.length < 2) return empty;

  const supabase = await createClient();
  const like = `%${q}%`;

  const [prodRes, orderRes, clientRes] = await Promise.all([
    supabase.from("products")
      .select("id, name, main_image_url, current_price, status")
      .or(`name.ilike.${like},sku.ilike.${like}`)
      .limit(6),
    supabase.from("orders")
      .select("id, order_number, customer_name, order_status, total_amount")
      .or(`order_number.ilike.${like},customer_name.ilike.${like},customer_phone.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("profiles")
      .select("id, first_name, last_name, email, phone")
      .eq("role", "customer")
      .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
      .limit(6),
  ]);

  return {
    products: (prodRes.data ?? []).map((p) => ({
      id: p.id as string,
      name: p.name as string,
      image: (p.main_image_url as string | null) ?? null,
      price: (p.current_price as number) ?? 0,
      status: p.status as string,
    })),
    orders: (orderRes.data ?? []).map((o) => ({
      id: o.id as string,
      order_number: o.order_number as string,
      customer_name: o.customer_name as string,
      status: o.order_status as string,
      total: (o.total_amount as number) ?? 0,
    })),
    clients: (clientRes.data ?? []).map((c) => ({
      id: c.id as string,
      name: [c.first_name, c.last_name].filter(Boolean).join(" ") || (c.email as string) || "Client",
      email: (c.email as string | null) ?? (c.phone as string | null) ?? "",
    })),
  };
}

// ─── CONTACT (public) ─────────────────────────────────────────────────────────

export async function createContactMessage(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();
  if (!name || !message) return { error: "Nom et message requis" };

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email: formData.get("email") || null,
    subject: formData.get("subject") || null,
    message,
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ─── ADMIN — IMAGE UPLOAD ─────────────────────────────────────────────────────

export async function uploadImage(bucket: string, formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("uploadImage:", error);
    return { error: error.message };
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: publicUrl };
}

// ─── ADMIN — IA (génération fiche produit via OpenAI) ─────────────────────────

export interface GeneratedProductInfo {
  name: string;
  short_description: string;
  description: string;
  seo_title: string;
  seo_description: string;
}

/**
 * Analyse une photo de produit avec l'API Vision d'OpenAI et génère
 * automatiquement le nom, les descriptions et les champs SEO en français.
 */
export async function generateProductInfo(
  imageUrl: string,
): Promise<{ data?: GeneratedProductInfo; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "Clé OpenAI manquante : ajoutez OPENAI_API_KEY dans .env.local." };
  if (!imageUrl) return { error: "Aucune image à analyser." };

  const prompt = `Analyse cette photo de produit destinée à la boutique en ligne Assada (Casablanca, prix en DH).
À partir de ce que tu vois (type de produit, marque visible, couleur, matière, style), génère une fiche produit commerciale en français pour le marché marocain (Casablanca).

Réponds STRICTEMENT en JSON (sans markdown) avec ces clés :
- "name": nom court et précis du produit (max 60 caractères), inclut la marque uniquement si elle est clairement visible.
- "short_description": accroche d'une seule phrase (max 120 caractères).
- "description": description détaillée et vendeuse (3 à 5 phrases) mettant en avant caractéristiques et bénéfices.
- "seo_title": titre SEO au format « {Produit} à Casablanca | Assada » (max 60 caractères).
- "seo_description": meta description SEO (max 155 caractères) incitant à l'achat, mentionnant livraison rapide partout à Casablanca et paiement à la livraison.

N'invente jamais une marque dont tu n'es pas sûr.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Tu es un expert e-commerce qui rédige des fiches produits en français, commerciales, claires et optimisées SEO pour Assada, une boutique en ligne à Casablanca.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("generateProductInfo OpenAI:", res.status, body);
      return { error: `OpenAI a renvoyé une erreur (${res.status}). Vérifiez votre clé et votre crédit.` };
    }

    const json = await res.json();
    const content: string | undefined = json?.choices?.[0]?.message?.content;
    if (!content) return { error: "Réponse vide de l'IA." };

    const parsed = JSON.parse(content) as Partial<GeneratedProductInfo>;
    return {
      data: {
        name: parsed.name ?? "",
        short_description: parsed.short_description ?? "",
        description: parsed.description ?? "",
        seo_title: parsed.seo_title ?? "",
        seo_description: parsed.seo_description ?? "",
      },
    };
  } catch (e) {
    console.error("generateProductInfo:", e);
    return { error: "Impossible d'analyser l'image pour le moment." };
  }
}
