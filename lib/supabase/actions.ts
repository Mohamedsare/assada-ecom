"use server";

import { createClient } from "./server";
import { createAdminClient } from "./admin";
import { getCurrentProfile } from "./queries";
import { ensurePermission, ensureSensitive } from "./guards";
import { isFullAccessRole, defaultEmployeePermissions } from "@/lib/permissions";
import { PAGE_IMAGE_DEFAULTS, type HeroSlide } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { PermissionMatrix, Order } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyAuthError(error) };

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

  if (error) return { error: friendlyAuthError(error) };
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
  if (error) throw new Error(friendlyAuthError(error));
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
  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/compte");
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendlyAuthError(error) };
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

  if (error) return { error: friendlyDbError(error) };
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

  if (error) return { error: friendlyDbError(error) };
  revalidatePath("/compte/adresses");
  return { success: true };
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté" };

  const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: friendlyDbError(error) };
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
  const order_number = `${year}-${random}`;

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

  if (orderError) { console.error("createGuestOrder:", orderError); return { error: friendlyDbError(orderError) }; }

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
  if (itemsError) { console.error("createGuestOrder items:", itemsError); return { error: friendlyDbError(itemsError) }; }

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

/** Traduit une erreur Postgres/Supabase en message clair pour l'utilisateur. */
function friendlyDbError(error: { code?: string; message?: string }, context?: string): string {
  switch (error.code) {
    case "23505": // unique_violation
      return context ?? "Cette valeur existe déjà. Modifiez-la puis réessayez.";
    case "23503": // foreign_key_violation
      return "Un élément lié est introuvable ou encore utilisé ailleurs.";
    case "23502": // not_null_violation
      return "Un champ obligatoire est manquant.";
    case "23514": // check_violation
      return "Une valeur saisie n'est pas valide.";
    case "42501": // insufficient_privilege (RLS)
      return "Vous n'avez pas les droits pour effectuer cette action.";
    default:
      return "Une erreur est survenue. Vérifiez les informations puis réessayez.";
  }
}

/** Traduit une erreur d'authentification Supabase en message clair (français). */
function friendlyAuthError(error: { message?: string }): string {
  const m = (error.message ?? "").toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("already exists"))
    return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("password should be") || m.includes("at least 6")) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (m.includes("email not confirmed")) return "Veuillez confirmer votre e-mail avant de vous connecter.";
  if (m.includes("rate limit") || m.includes("too many")) return "Trop de tentatives. Réessayez dans quelques minutes.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Adresse e-mail invalide.";
  return "Une erreur est survenue. Veuillez réessayer.";
}

/** Génère un slug unique pour un produit (ajoute -2, -3… si le nom existe déjà). */
async function uniqueProductSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = base || "produit";
  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const { data } = await supabase.from("products").select("id").eq("slug", candidate).maybeSingle();
    if (!data || (excludeId && data.id === excludeId)) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function adminCreateProduct(formData: FormData) {
  const gate = await ensurePermission("products", "create");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const baseSlug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = await uniqueProductSlug(supabase, baseSlug);

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
    is_story: formData.get("is_story") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  }).select().single();

  if (error) {
    console.error("adminCreateProduct:", error);
    return { error: friendlyDbError(error, "Un produit portant ce nom existe déjà. Choisissez un autre nom.") };
  }

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
  revalidatePath("/");
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
    is_story: formData.get("is_story") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) {
    console.error("adminUpdateProduct:", error);
    return { error: friendlyDbError(error, "Un produit portant ce nom existe déjà. Choisissez un autre nom.") };
  }

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
  revalidatePath("/");
  revalidatePath(`/admin/produits/${id}/modifier`);
  return { success: true };
}

export async function adminDeleteProduct(id: string) {
  const gate = await ensurePermission("products", "delete");
  if (!gate.ok) throw new Error(gate.error);
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(friendlyDbError(error));
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
}

// ─── ADMIN — PACKS (coffrets cadeaux) ─────────────────────────────────────────

interface PackItemInput { product_id: string; quantity: number }

/** Lit la composition d'un pack depuis le champ JSON "pack_items" du formulaire. */
function readPackItems(formData: FormData): PackItemInput[] {
  const raw = formData.get("pack_items");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw)) as Array<{ product_id?: string; quantity?: number | string }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => ({ product_id: String(v.product_id ?? ""), quantity: Math.max(1, Math.floor(Number(v.quantity) || 1)) }))
      .filter((v) => v.product_id);
  } catch {
    return [];
  }
}

export async function adminCreatePack(formData: FormData) {
  const gate = await ensurePermission("products", "create");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const baseSlug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = await uniqueProductSlug(supabase, baseSlug);

  const images = readProductImages(formData);
  const mainImage = images[0] || null;

  const { data, error } = await supabase.from("products").insert({
    name,
    slug,
    is_pack: true,
    category_id: formData.get("category_id") || null,
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    current_price: Number(formData.get("current_price")),
    old_price: formData.get("old_price") ? Number(formData.get("old_price")) : null,
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    sku: formData.get("sku") || null,
    main_image_url: mainImage,
    is_featured: formData.get("is_featured") === "true",
    is_new: formData.get("is_new") === "true",
    is_promo: formData.get("is_promo") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  }).select().single();

  if (error) {
    console.error("adminCreatePack:", error);
    return { error: friendlyDbError(error, "Un coffret portant ce nom existe déjà. Choisissez un autre nom.") };
  }

  if (images.length) {
    await supabase.from("product_images").insert(
      images.map((url, i) => ({ product_id: data.id, image_url: url, sort_order: i, alt_text: name })),
    );
  }

  const packItems = readPackItems(formData);
  if (packItems.length) {
    await supabase.from("pack_items").insert(
      packItems.map((it, i) => ({ pack_id: data.id, product_id: it.product_id, quantity: it.quantity, sort_order: i })),
    );
  }

  revalidatePath("/admin/coffrets");
  revalidatePath("/coffrets-cadeaux");
  return { success: true, pack: data };
}

export async function adminUpdatePack(id: string, formData: FormData) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const images = readProductImages(formData);
  const mainImage = images[0] || null;

  const { error } = await supabase.from("products").update({
    name: formData.get("name"),
    category_id: formData.get("category_id") || null,
    short_description: formData.get("short_description"),
    description: formData.get("description"),
    current_price: Number(formData.get("current_price")),
    old_price: formData.get("old_price") ? Number(formData.get("old_price")) : null,
    stock_quantity: Number(formData.get("stock_quantity") ?? 0),
    sku: formData.get("sku") || null,
    main_image_url: mainImage,
    is_featured: formData.get("is_featured") === "true",
    is_new: formData.get("is_new") === "true",
    is_promo: formData.get("is_promo") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("is_pack", true);

  if (error) {
    console.error("adminUpdatePack:", error);
    return { error: friendlyDbError(error, "Un coffret portant ce nom existe déjà. Choisissez un autre nom.") };
  }

  // Resynchronise la galerie
  await supabase.from("product_images").delete().eq("product_id", id);
  if (images.length) {
    await supabase.from("product_images").insert(
      images.map((url, i) => ({ product_id: id, image_url: url, sort_order: i, alt_text: formData.get("name") })),
    );
  }

  // Resynchronise la composition du pack
  await supabase.from("pack_items").delete().eq("pack_id", id);
  const packItems = readPackItems(formData);
  if (packItems.length) {
    await supabase.from("pack_items").insert(
      packItems.map((it, i) => ({ pack_id: id, product_id: it.product_id, quantity: it.quantity, sort_order: i })),
    );
  }

  revalidatePath("/admin/coffrets");
  revalidatePath("/coffrets-cadeaux");
  revalidatePath(`/admin/coffrets/${id}/modifier`);
  return { success: true };
}

export async function adminDeletePack(id: string) {
  const gate = await ensurePermission("products", "delete");
  if (!gate.ok) throw new Error(gate.error);
  const supabase = await createClient();
  // pack_items est supprimé en cascade (FK on delete cascade).
  const { error } = await supabase.from("products").delete().eq("id", id).eq("is_pack", true);
  if (error) throw new Error(friendlyDbError(error));
  revalidatePath("/admin/coffrets");
  revalidatePath("/coffrets-cadeaux");
}

export async function adminToggleProductStatus(id: string, status: string) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("products")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: friendlyDbError(error) };
  revalidatePath("/admin/produits");
  return { success: true };
}

/** Édition rapide des champs courants d'un produit (modale « modif rapide »). */
export async function adminQuickUpdateProduct(
  id: string,
  fields: {
    name: string;
    current_price: number;
    old_price: number | null;
    stock_quantity: number;
    status: string;
    is_new: boolean;
    is_promo: boolean;
    is_featured: boolean;
  },
) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  if (!fields.name?.trim()) return { error: "Le nom est requis." };
  if (!Number.isFinite(fields.current_price) || fields.current_price < 0) return { error: "Prix invalide." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({
    name: fields.name.trim(),
    current_price: fields.current_price,
    old_price: fields.old_price,
    stock_quantity: fields.stock_quantity,
    status: fields.status,
    is_new: fields.is_new,
    is_promo: fields.is_promo,
    is_featured: fields.is_featured,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: friendlyDbError(error) };
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

  if (error) return { error: friendlyDbError(error) };
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

  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
  if (error) throw new Error(friendlyDbError(error));
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

  if (error) return { error: friendlyDbError(error) };
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

  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
  if (error) throw new Error(friendlyDbError(error));
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

  if (error) return { error: friendlyDbError(error) };

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

  if (error) return { error: friendlyDbError(error) };

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

  if (error) return { error: friendlyDbError(error) };
  revalidatePath(`/admin/commandes/${id}`);
  return { success: true };
}

/**
 * Suppression complète d'une commande (permission sensible `delete`).
 * Passe par le client service_role : le cascade en base supprime aussi
 * order_items, payments et order_tracking liés.
 */
export async function adminDeleteOrder(id: string) {
  const gate = await ensurePermission("orders", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = createAdminClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/admin/commandes");
  revalidatePath("/admin/livraisons");
  revalidatePath("/admin/paiements");
  return { success: true };
}

// ─── ADMIN — SETTINGS ────────────────────────────────────────────────────────

export async function adminUpdateSettings(formData: FormData) {
  const gate = await ensurePermission("settings", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();

  const keys = [
    "shop_name", "shop_logo", "shop_email", "shop_phone", "shop_whatsapp",
    "shop_address", "shop_city", "delivery_fee", "free_delivery_threshold",
    "facebook_url", "tiktok_url", "instagram_url",
    "invoice_format", "invoice_footer",
  ];

  const upserts = keys.map((key) => ({
    key,
    value: formData.get(key) !== null ? JSON.stringify(formData.get(key)) : null,
  })).filter((u) => u.value !== null) as { key: string; value: string }[];

  const { error } = await supabase.from("settings").upsert(upserts, { onConflict: "key" });
  if (error) {
    console.error("adminUpdateSettings:", error);
    return { error: friendlyDbError(error) };
  }

  revalidatePath("/admin/parametres");
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── ADMIN — GESTION DES PAGES (images éditables) ─────────────────────────────

/** Met à jour les images éditables du site (bannières hero, bannières de pages). Réservé aux admins. */
export async function adminUpdatePageImages(formData: FormData) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };

  const supabase = await createClient();
  const rows = Object.keys(PAGE_IMAGE_DEFAULTS).map((key) => ({
    key,
    // Valeur vide = on revient à l'image par défaut (getPageImages ignore les vides).
    value: JSON.stringify(((formData.get(key) as string) ?? "").trim()),
  }));

  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  if (error) {
    console.error("adminUpdatePageImages:", error);
    return { error: friendlyDbError(error) };
  }

  revalidatePath("/", "layout");   // rafraîchit les bannières publiques
  revalidatePath("/admin/reglages");
  return { success: true };
}

/**
 * Enregistre la liste des slides du slider d'accueil (images/vidéos). Réservé aux admins.
 * La liste est stockée dans le réglage `hero_slides` (tableau JSON ordonné).
 */
export async function adminUpdateHeroSlides(slides: HeroSlide[]) {
  const current = await getCurrentProfile();
  if (!current || !isFullAccessRole(current.role)) return { error: "Accès refusé." };

  // Nettoyage / validation : on ne garde que des entrées bien formées.
  const clean = (Array.isArray(slides) ? slides : [])
    .filter((s) => s && typeof s.url === "string" && s.url.trim() !== "" && (s.type === "image" || s.type === "video"))
    .map((s) => {
      const out: HeroSlide = { type: s.type, url: s.url.trim() };
      if (typeof s.title === "string" && s.title.trim()) out.title = s.title.trim();
      if (typeof s.link === "string" && s.link.trim()) out.link = s.link.trim();
      return out;
    });

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "hero_slides", value: JSON.stringify(clean) }, { onConflict: "key" });
  if (error) {
    console.error("adminUpdateHeroSlides:", error);
    return { error: friendlyDbError(error) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/reglages");
  return { success: true };
}

// ─── ADMIN — REVIEWS ──────────────────────────────────────────────────────────

export async function adminUpdateReviewApproval(id: string, is_approved: boolean) {
  const gate = await ensurePermission("products", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
  if (error) return { error: friendlyDbError(error) };
  revalidatePath("/admin/avis");
  return { success: true };
}

export async function adminDeleteReview(id: string) {
  const gate = await ensurePermission("products", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error) };
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

  if (error) return { error: friendlyDbError(error) };

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

  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function adminDeleteMessage(id: string) {
  const gate = await ensurePermission("clients", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminToggleDeliveryAgentActive(id: string, is_active: boolean) {
  const gate = await ensurePermission("delivery", "edit");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_agents")
    .update({ is_active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: friendlyDbError(error) };
  revalidatePath("/admin/livreurs");
  return { success: true };
}

export async function adminDeleteDeliveryAgent(id: string) {
  const gate = await ensurePermission("delivery", "delete");
  if (!gate.ok) return { error: gate.error };
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_agents").delete().eq("id", id);
  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
  if (error) return { error: friendlyDbError(error) };
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
    console.error("adminCreateUser:", error);
    return { error: friendlyAuthError(error) };
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
  if (upErr) { console.error("adminCreateUser profile:", upErr); return { error: friendlyDbError(upErr) }; }

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
  if (error) return { error: friendlyDbError(error) };
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
    phone: (formData.get("phone") as string)?.trim() || null,
    subject: formData.get("subject") || null,
    message,
  });

  if (error) return { error: friendlyDbError(error) };
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
    return { error: friendlyDbError(error) };
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: publicUrl };
}

// ─── ADMIN — IA (shooting studio photo produit via Photoroom) ────────────────

/**
 * « Shooting » studio d'une photo produit via l'API Photoroom v2.
 * Détoure le produit (sans l'altérer), le pose sur un fond studio blanc avec
 * une ombre douce, recadre en carré 1200×1200 (format de la carte produit) et
 * ré-uploade le résultat dans le bucket `products`. Renvoie la nouvelle URL.
 */
export async function studioProductImage(
  imageUrl: string,
): Promise<{ url?: string; error?: string }> {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) return { error: "Clé Photoroom manquante : ajoutez PHOTOROOM_API_KEY dans .env.local." };
  if (!imageUrl) return { error: "Aucune image à traiter." };

  try {
    const params = new URLSearchParams({
      imageUrl,
      removeBackground: "true",
      "background.color": "FFFFFF",
      "shadow.mode": "ai.soft",
      outputSize: "1200x1200",
      padding: "0.1",
      "export.format": "jpg",
    });

    const res = await fetch(`https://image-api.photoroom.com/v2/edit?${params.toString()}`, {
      method: "GET",
      headers: { "x-api-key": apiKey, Accept: "image/jpeg" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("studioProductImage Photoroom:", res.status, body.slice(0, 300));
      if (res.status === 402) return { error: "Crédit Photoroom épuisé. Rechargez votre compte Photoroom." };
      if (res.status === 401 || res.status === 403) return { error: "Clé Photoroom invalide. Vérifiez PHOTOROOM_API_KEY." };
      return { error: `Photoroom a renvoyé une erreur (${res.status}).` };
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    const supabase = await createClient();
    const filename = `studio-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filename, buffer, { contentType: "image/jpeg", upsert: false });

    if (error) {
      console.error("studioProductImage upload:", error);
      return { error: friendlyDbError(error) };
    }

    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(data.path);
    return { url: publicUrl };
  } catch (e) {
    console.error("studioProductImage:", e);
    return { error: "Traitement studio impossible. Réessayez." };
  }
}

// ─── ADMIN — IA (couche commune OpenAI + fallback DeepSeek) ───────────────────

interface AiChatOptions {
  messages: unknown[];
  max_tokens?: number;
  temperature?: number;
  response_format?: unknown;
  /**
   * `true` si `messages` contient une image (Vision). L'API DeepSeek n'accepte
   * pas d'images : dans ce cas DeepSeek n'est utilisé en secours QUE si
   * `textFallbackMessages` (version sans image) est fourni.
   */
  vision?: boolean;
  /**
   * Messages 100 % texte utilisés uniquement quand DeepSeek prend le relais
   * d'une requête Vision (puisqu'il ne peut pas voir l'image). À ne fournir
   * que si un résultat sans analyse d'image reste pertinent (ex. copie
   * créative), jamais pour de l'extraction factuelle depuis la photo.
   */
  textFallbackMessages?: unknown[];
}

interface AiChatResult {
  content?: string;
  provider?: "openai" | "deepseek";
  error?: string;
}

const AI_LABELS: Record<"openai" | "deepseek", string> = {
  openai: "OpenAI",
  deepseek: "DeepSeek",
};
// Codes HTTP temporaires : on retente le même fournisseur avant de basculer.
const AI_RETRYABLE = new Set([429, 500, 502, 503, 529]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Appelle un LLM compatible « chat completions » avec OpenAI en primaire et
 * DeepSeek en secours automatique. Bascule sur DeepSeek si OpenAI échoue (clé
 * absente, 429/5xx après retry, réseau, réponse vide). Pour les requêtes
 * Vision, DeepSeek n'est tenté que si un jeu de messages texte de repli est
 * fourni (il ne peut pas analyser l'image elle-même).
 */
async function callAiChat(opts: AiChatOptions): Promise<AiChatResult> {
  const deepseekModel = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const providers: {
    id: "openai" | "deepseek";
    url: string;
    apiKey: string;
    model: string;
    messages: unknown[];
  }[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      id: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      messages: opts.messages,
    });
  }
  // DeepSeek en secours : messages texte pour une requête Vision (il ne voit
  // pas l'image), sinon les messages d'origine.
  const deepseekMessages = opts.vision ? opts.textFallbackMessages : opts.messages;
  if (process.env.DEEPSEEK_API_KEY && deepseekMessages) {
    providers.push({
      id: "deepseek",
      url: "https://api.deepseek.com/chat/completions",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: deepseekModel,
      messages: deepseekMessages,
    });
  }

  if (providers.length === 0) {
    return {
      error:
        opts.vision && !opts.textFallbackMessages
          ? "Clé OpenAI manquante : ajoutez OPENAI_API_KEY dans .env.local. (L'analyse d'image nécessite OpenAI.)"
          : "Aucune clé IA configurée : ajoutez OPENAI_API_KEY ou DEEPSEEK_API_KEY dans .env.local.",
    };
  }

  let lastError = "Service IA indisponible pour le moment.";

  for (const p of providers) {
    // Jusqu'à 2 tentatives par fournisseur sur erreur temporaire (429/5xx).
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(p.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${p.apiKey}`,
          },
          body: JSON.stringify({
            model: p.model,
            ...(opts.max_tokens !== undefined ? { max_tokens: opts.max_tokens } : {}),
            ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
            ...(opts.response_format ? { response_format: opts.response_format } : {}),
            messages: p.messages,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`callAiChat ${p.id}:`, res.status, body.slice(0, 300));
          lastError = `${AI_LABELS[p.id]} a renvoyé une erreur (${res.status}).`;
          if (AI_RETRYABLE.has(res.status) && attempt === 0) {
            await sleep(800); // courte pause puis nouvelle tentative
            continue;
          }
          break; // erreur définitive → fournisseur suivant (fallback)
        }

        const json = await res.json();
        const content: string | undefined = json?.choices?.[0]?.message?.content;
        if (!content) {
          lastError = `Réponse vide de ${AI_LABELS[p.id]}.`;
          break;
        }
        return { content, provider: p.id };
      } catch (e) {
        console.error(`callAiChat ${p.id}:`, e);
        lastError = `Erreur réseau avec ${AI_LABELS[p.id]}.`;
        if (attempt === 0) {
          await sleep(800);
          continue;
        }
        break;
      }
    }
  }

  return { error: lastError };
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
  if (!imageUrl) return { error: "Aucune image à analyser." };

  const prompt = `Analyse cette photo de produit destinée à la boutique en ligne RYTA (Casablanca, prix en DH).
À partir de ce que tu vois (type de produit, marque visible, couleur, matière, style), génère une fiche produit commerciale en français pour le marché marocain (Casablanca).

Réponds STRICTEMENT en JSON (sans markdown) avec ces clés :
- "name": nom court et précis du produit (max 60 caractères), inclut la marque uniquement si elle est clairement visible.
- "short_description": accroche d'une seule phrase (max 120 caractères).
- "description": description détaillée et vendeuse (3 à 5 phrases) mettant en avant caractéristiques et bénéfices.
- "seo_title": titre SEO au format « {Produit} à Casablanca | RYTA » (max 60 caractères).
- "seo_description": meta description SEO (max 155 caractères) incitant à l'achat, mentionnant livraison partout au Maroc et paiement à la livraison.

N'invente jamais une marque dont tu n'es pas sûr.`;

  // Requête Vision : OpenAI uniquement (DeepSeek ne traite pas les images).
  const result = await callAiChat({
    vision: true,
    max_tokens: 800,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Tu es un expert e-commerce qui rédige des fiches produits en français, commerciales, claires et optimisées SEO pour RYTA, une boutique en ligne à Casablanca.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });

  if (result.error || !result.content) {
    return { error: result.error ?? "Impossible d'analyser l'image pour le moment." };
  }

  try {
    const parsed = JSON.parse(result.content) as Partial<GeneratedProductInfo>;
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
    console.error("generateProductInfo parse:", e);
    return { error: "Réponse IA illisible. Réessayez." };
  }
}

/**
 * Analyse le visuel d'une bannière (image, ou frame extraite d'une vidéo passée en data URL)
 * et propose un grand titre court et accrocheur pour le slider d'accueil, en français.
 */
export async function generateBannerTitle(
  imageUrl: string,
): Promise<{ title?: string; error?: string }> {
  if (!imageUrl) return { error: "Aucun visuel à analyser." };

  const prompt = `Regarde ce visuel de bannière pour la boutique en ligne RYTA (Casablanca) : beauté & bien-être, compléments alimentaires et produits du terroir marocain.
À partir de ce que tu vois (produits, ambiance, couleurs, thème), propose UN grand titre marketing court et accrocheur en français, adapté à une bannière d'accueil.

Contraintes :
- 2 à 6 mots, percutant (max ~40 caractères).
- Pas de point final, pas de guillemets, pas d'emoji.
- Ton premium et commercial, adapté au marché marocain.

Réponds STRICTEMENT en JSON (sans markdown) : { "title": "..." }`;

  // Repli DeepSeek (sans image) : le titre est de la copie créative, pas une
  // extraction factuelle — un titre premium générique reste pertinent.
  const fallbackPrompt = `Propose UN grand titre marketing court et accrocheur en français pour une bannière d'accueil de la boutique en ligne RYTA (Casablanca) : beauté & bien-être, compléments alimentaires et produits du terroir marocain.

Contraintes :
- 2 à 6 mots, percutant (max ~40 caractères).
- Pas de point final, pas de guillemets, pas d'emoji.
- Ton premium et commercial, adapté au marché marocain.

Réponds STRICTEMENT en JSON (sans markdown) : { "title": "..." }`;

  const systemMsg = {
    role: "system",
    content:
      "Tu es un directeur artistique e-commerce qui écrit des titres de bannières courts, percutants et premium en français pour RYTA (Casablanca).",
  };

  // Vision (OpenAI) en primaire, repli texte (DeepSeek) sans image.
  const result = await callAiChat({
    vision: true,
    max_tokens: 60,
    response_format: { type: "json_object" },
    messages: [
      systemMsg,
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    textFallbackMessages: [systemMsg, { role: "user", content: fallbackPrompt }],
  });

  if (result.error || !result.content) {
    return { error: result.error ?? "Impossible d'analyser le visuel pour le moment." };
  }

  try {
    const parsed = JSON.parse(result.content) as { title?: string };
    const title = (parsed.title ?? "").trim();
    if (!title) return { error: "L'IA n'a pas pu proposer de titre." };
    return { title };
  } catch (e) {
    console.error("generateBannerTitle parse:", e);
    return { error: "Réponse IA illisible. Réessayez." };
  }
}

// ─── ADMIN — IA (message WhatsApp de confirmation de commande) ────────────────

const ORDER_PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
  airtel_money: "Airtel Money",
  moov_money: "Moov Money",
};

/** Message de secours, toujours propre, utilisé si l'IA échoue ou est indisponible. */
function buildBackupConfirmationMessage(order: Order): string {
  const items = (order.items ?? [])
    .map((it) => `• ${it.quantity}× ${it.product_name}`)
    .join("\n");
  const payment = ORDER_PAYMENT_LABELS[order.payment_method] ?? "Paiement à la livraison";
  const lieu = [order.delivery_district, order.delivery_city].filter(Boolean).join(", ");

  return [
    `Bonjour ${order.customer_name},`,
    ``,
    `Merci pour votre commande chez RYTA ! Nous vous confirmons sa bonne réception.`,
    ``,
    `🧾 Commande ${order.order_number}`,
    items,
    `💰 Total : ${formatPrice(order.total_amount)} (${payment})`,
    lieu ? `📍 Livraison : ${lieu}` : ``,
    ``,
    `Nous préparons votre colis et revenons vers vous pour organiser la livraison.`,
    `Pour toute question, répondez simplement à ce message.`,
    ``,
    `À très vite,`,
    `L'équipe RYTA — Casablanca`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

/**
 * Génère via l'IA un message WhatsApp de confirmation de commande, propre et
 * personnalisé. Ne lève jamais : si l'IA échoue (clé manquante, erreur réseau,
 * réponse vide), renvoie un message de secours tout aussi soigné.
 * `ai: true` indique que le texte provient de l'IA.
 */
export async function generateOrderConfirmationMessage(
  orderId: string,
): Promise<{ message: string; ai: boolean }> {
  const gate = await ensurePermission("orders", "view");
  // Sans droit de lecture, on renvoie un message générique minimal.
  if (!gate.ok) {
    return { message: "Bonjour, nous vous contactons au sujet de votre commande RYTA.", ai: false };
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  if (!order) {
    return { message: "Bonjour, nous vous contactons au sujet de votre commande RYTA.", ai: false };
  }

  const backup = buildBackupConfirmationMessage(order as Order);

  const itemsText = ((order as Order).items ?? [])
    .map((it) => `- ${it.quantity}x ${it.product_name} (${formatPrice(it.total_price)})`)
    .join("\n");
  const payment = ORDER_PAYMENT_LABELS[order.payment_method] ?? "Paiement à la livraison";
  const lieu = [order.delivery_district, order.delivery_city].filter(Boolean).join(", ");

  const prompt = `Tu écris un message WhatsApp de CONFIRMATION de commande, envoyé par la boutique RYTA (cosmétiques & beauté, Casablanca) à sa cliente/son client.

Données de la commande :
- Client : ${order.customer_name}
- N° commande : ${order.order_number}
- Articles :
${itemsText || "- (non détaillé)"}
- Total : ${formatPrice(order.total_amount)}
- Paiement : ${payment}
- Livraison : ${lieu || "Casablanca"}

Rédige le message en français, prêt à être envoyé tel quel. Exigences :
- Ton chaleureux, poli, premium et rassurant, adapté au marché marocain.
- Confirme la réception de la commande et annonce le contact pour la livraison.
- Rappelle le n° de commande, la liste des articles (courte), le total et le mode de paiement.
- Utilise quelques emojis pertinents avec parcimonie et des retours à la ligne pour l'aérer.
- Termine par une signature "L'équipe RYTA — Casablanca".
- N'invente aucune information absente des données. Pas de markdown, pas de guillemets autour du message.

Réponds STRICTEMENT en JSON (sans markdown) : { "message": "..." }`;

  // Requête texte : OpenAI en primaire, DeepSeek en secours automatique.
  const result = await callAiChat({
    max_tokens: 400,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Tu es le/la responsable relation client de RYTA (Casablanca). Tu écris des messages WhatsApp de confirmation de commande impeccables, chaleureux et professionnels en français.",
      },
      { role: "user", content: prompt },
    ],
  });

  if (result.error || !result.content) return { message: backup, ai: false };

  try {
    const parsed = JSON.parse(result.content) as { message?: string };
    const message = (parsed.message ?? "").trim();
    if (!message) return { message: backup, ai: false };
    return { message, ai: true };
  } catch (e) {
    console.error("generateOrderConfirmationMessage parse:", e);
    return { message: backup, ai: false };
  }
}
