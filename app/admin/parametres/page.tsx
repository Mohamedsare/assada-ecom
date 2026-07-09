import { getSettings } from "@/lib/supabase/queries";
import { requireAdmin } from "@/lib/supabase/guards";
import { SITE_NAME, SITE_EMAIL, SITE_PHONE, SOCIAL_LINKS, DEFAULT_DELIVERY_FEE, DEFAULT_FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import SettingsForm, { type SettingsValues } from "./SettingsForm";

export const metadata = { title: "Paramètres de la boutique" };
export const dynamic = "force-dynamic";

/** Lit une valeur de réglage (gère le cas où elle est encodée en JSON). */
function read(raw: unknown, fallback = ""): string {
  if (raw == null) return fallback;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "string" ? parsed : raw;
    } catch {
      return raw;
    }
  }
  return String(raw);
}

export default async function AdminParametresPage() {
  await requireAdmin();
  const s = await getSettings();

  const initial: SettingsValues = {
    shop_name:               read(s.shop_name, SITE_NAME),
    shop_email:              read(s.shop_email, SITE_EMAIL),
    shop_phone:              read(s.shop_phone, SITE_PHONE),
    shop_whatsapp:           read(s.shop_whatsapp, SITE_PHONE),
    shop_city:               read(s.shop_city, "Casablanca"),
    shop_address:            read(s.shop_address, ""),
    delivery_fee:            read(s.delivery_fee, String(DEFAULT_DELIVERY_FEE)),
    free_delivery_threshold: read(s.free_delivery_threshold, String(DEFAULT_FREE_DELIVERY_THRESHOLD)),
    facebook_url:            read(s.facebook_url, SOCIAL_LINKS.facebook),
    tiktok_url:              read(s.tiktok_url, SOCIAL_LINKS.tiktok),
    instagram_url:           read(s.instagram_url, SOCIAL_LINKS.instagram),
    invoice_format:          read(s.invoice_format, "a4"),
    invoice_footer:          read(s.invoice_footer, "Merci pour votre confiance et à très bientôt chez RYTA."),
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#020B27] mb-1">Paramètres de la boutique</h1>
      <p className="text-text-secondary text-sm mb-6">Gérez les informations et la configuration de votre boutique</p>
      <SettingsForm initial={initial} />
    </div>
  );
}
