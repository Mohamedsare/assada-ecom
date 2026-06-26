"use server";

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });
  if (error) return { error: error.message };
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

export async function adminCreateProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
    main_image_url: formData.get("main_image_url") || null,
    is_featured: formData.get("is_featured") === "true",
    is_new: formData.get("is_new") === "true",
    is_promo: formData.get("is_promo") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
  }).select().single();

  if (error) return { error: error.message };
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true, product: data };
}

export async function adminUpdateProduct(id: string, formData: FormData) {
  const supabase = await createClient();

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
    main_image_url: formData.get("main_image_url") || null,
    is_featured: formData.get("is_featured") === "true",
    is_new: formData.get("is_new") === "true",
    is_promo: formData.get("is_promo") === "true",
    status: formData.get("status") ?? "active",
    seo_title: formData.get("seo_title") || null,
    seo_description: formData.get("seo_description") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true };
}

export async function adminDeleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/produits");
  revalidatePath("/boutique");
  return { success: true };
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
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
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
  if (error) return { error: error.message };
  revalidatePath("/admin/marques");
  return { success: true };
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

// ─── ADMIN — IMAGE UPLOAD ─────────────────────────────────────────────────────

export async function uploadImage(bucket: string, file: File): Promise<string | null> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).upload(filename, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) { console.error("uploadImage:", error); return null; }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}
