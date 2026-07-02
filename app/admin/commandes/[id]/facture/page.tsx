import { notFound } from "next/navigation";
import { getAdminOrderById, getSettings } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import { SITE_NAME, SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import Invoice, { type InvoiceShop, type InvoiceFormat } from "@/components/admin/Invoice";

export const metadata = { title: "Facture" };
export const dynamic = "force-dynamic";

/** Lit une valeur de réglage (gère l'encodage JSON éventuel). */
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

export default async function FacturePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("orders", "view");
  const { id } = await params;
  const [order, settings] = await Promise.all([getAdminOrderById(id), getSettings()]);
  if (!order) notFound();

  const shop: InvoiceShop = {
    name: read(settings.shop_name, SITE_NAME),
    address: read(settings.shop_address, "Galerie Derb Ghalef, Bd Abdelmoumen"),
    city: read(settings.shop_city, "Casablanca, Maroc"),
    phone: read(settings.shop_phone, SITE_PHONE),
    email: read(settings.shop_email, SITE_EMAIL),
    footer: read(settings.invoice_footer, "Merci pour votre confiance et à très bientôt chez Assada."),
  };

  const rawFormat = read(settings.invoice_format, "a4");
  const defaultFormat: InvoiceFormat =
    rawFormat === "thermique_58" ? "thermique_58"
    : rawFormat === "thermique_80" || rawFormat === "thermique" ? "thermique_80"
    : "a4";

  // Numéro de facture dérivé du numéro de commande (préfixe FAC-).
  const invoiceNumber = `FAC-${order.order_number}`;

  return <Invoice order={order} invoiceNumber={invoiceNumber} shop={shop} defaultFormat={defaultFormat} />;
}
