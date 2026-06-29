"use server";

import { createClient } from "./server";
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

  const updates = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/compte");
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
  customer: { first_name: string; last_name: string; phone: string; email: string };
  address: { city: string; district: string; address_details: string; landmark: string };
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
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  const order_number = `ODMS-${year}-${random}`;

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
      delivery_address_details: data.address.address_details,
      delivery_landmark: data.address.landmark || null,
      payment_method: data.payment.method,
      payment_status: "pending",
      order_status: "pending",
      subtotal: data.subtotal,
      delivery_fee: data.delivery_fee,
      discount_amount: 0,
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

  // Premier tracking
  await supabase.from("order_tracking").insert({
    order_id: order.id,
    status: "pending",
    message: "Commande reçue et en attente de confirmation.",
  });

  return { success: true, order_number };
}

// ─── ADMIN — PRODUCTS ────────────────────────────────────────────────────────

/** Récupère jusqu'à 5 URLs d'images depuis le FormData (champs "images"). */
function readProductImages(formData: FormData): string[] {
  return formData.getAll("images").map((v) => String(v)).filter(Boolean).slice(0, 5);
}

export async function adminCreateProduct(formData: FormData) {
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

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true, product: data };
}

export async function adminUpdateProduct(id: string, formData: FormData) {
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

  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true };
}

export async function adminDeleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
}

export async function adminToggleProductStatus(id: string, status: string) {
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

export async function adminDeleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
}

// ─── ADMIN — BRANDS ──────────────────────────────────────────────────────────

export async function adminCreateBrand(formData: FormData) {
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

export async function adminDeleteBrand(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marques");
}

// ─── ADMIN — ORDERS ───────────────────────────────────────────────────────────

export async function adminUpdateOrderStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("orders").update({
    order_status: status,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };

  // Ajouter un événement de tracking
  await supabase.from("order_tracking").insert({
    order_id: id,
    status,
    message: getStatusMessage(status),
  });

  revalidatePath("/admin/commandes");
  return { success: true };
}

export async function adminUpdatePaymentStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({
    payment_status: status,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/commandes");
  return { success: true };
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    confirmed: "Votre commande a été confirmée.",
    preparing: "Votre commande est en cours de préparation.",
    shipped: "Votre commande a été expédiée.",
    out_for_delivery: "Votre livreur est en route.",
    delivered: "Votre commande a été livrée avec succès.",
    cancelled: "Votre commande a été annulée.",
    returned: "Votre commande a été retournée.",
  };
  return messages[status] ?? "Statut mis à jour.";
}

// ─── ADMIN — SETTINGS ────────────────────────────────────────────────────────

export async function adminUpdateSettings(formData: FormData) {
  const supabase = await createClient();

  const keys = [
    "shop_name", "shop_email", "shop_phone", "shop_whatsapp",
    "shop_address", "shop_city", "delivery_fee", "free_delivery_threshold",
    "facebook_url", "tiktok_url", "instagram_url",
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

// ─── ADMIN — REVIEWS ──────────────────────────────────────────────────────────

export async function adminUpdateReviewApproval(id: string, is_approved: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/avis");
  return { success: true };
}

export async function adminDeleteReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/avis");
  return { success: true };
}

// ─── ADMIN — PAYMENTS (table) ─────────────────────────────────────────────────

export async function adminUpdatePayment(id: string, status: string) {
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
  const supabase = await createClient();
  const qty = Math.max(0, Math.floor(stock_quantity));
  const { error } = await supabase.from("products")
    .update({
      stock_quantity: qty,
      status: qty === 0 ? "out_of_stock" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/stocks");
  revalidatePath("/admin/produits");
  return { success: true };
}

// ─── ADMIN — USERS (rôles) ────────────────────────────────────────────────────

export async function adminUpdateUserRole(id: string, role: string) {
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
  const supabase = await createClient();
  const { error } = await supabase.from("profiles")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin/clients");
  return { success: true };
}

// ─── ADMIN — COUPONS ──────────────────────────────────────────────────────────

export async function adminCreateCoupon(formData: FormData) {
  const supabase = await createClient();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { error: "Code requis" };

  const { error } = await supabase.from("coupons").insert({
    code,
    description: formData.get("description") || null,
    discount_type: formData.get("discount_type") || "percentage",
    discount_value: Number(formData.get("discount_value")),
    min_order_amount: formData.get("min_order_amount") ? Number(formData.get("min_order_amount")) : 0,
    max_uses: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
    is_active: formData.get("is_active") !== "false",
    expires_at: formData.get("expires_at") || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function adminToggleCoupon(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").update({ is_active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/promotions");
  return { success: true };
}

export async function adminDeleteCoupon(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/promotions");
  return { success: true };
}

// ─── ADMIN — MESSAGES ─────────────────────────────────────────────────────────

export async function adminMarkMessageRead(id: string, is_read: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
  return { success: true };
}

export async function adminDeleteMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
  return { success: true };
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

  const prompt = `Analyse cette photo de produit destinée à la boutique en ligne Odm's Shopping (Gabon, prix en FCFA).
À partir de ce que tu vois (type de produit, marque visible, couleur, matière, style), génère une fiche produit commerciale en français pour le marché gabonais.

Réponds STRICTEMENT en JSON (sans markdown) avec ces clés :
- "name": nom court et précis du produit (max 60 caractères), inclut la marque uniquement si elle est clairement visible.
- "short_description": accroche d'une seule phrase (max 120 caractères).
- "description": description détaillée et vendeuse (3 à 5 phrases) mettant en avant caractéristiques et bénéfices.
- "seo_title": titre SEO au format « {Produit} au Gabon | Odm's Shopping » (max 60 caractères).
- "seo_description": meta description SEO (max 155 caractères) incitant à l'achat, mentionnant livraison rapide partout au Gabon et paiement à la livraison.

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
              "Tu es un expert e-commerce qui rédige des fiches produits en français, commerciales, claires et optimisées SEO pour Odm's Shopping, une boutique en ligne au Gabon.",
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
