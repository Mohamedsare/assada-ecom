import { redirect } from "next/navigation";
import { getCurrentProfile, getAdminOrders, getAdminProducts, getShopLogo } from "@/lib/supabase/queries";
import AdminLayoutClient, { type AdminNotification } from "./AdminLayoutClient";
import RealtimeRefresh from "@/components/admin/RealtimeRefresh";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  super_admin: "Super Admin",
  employee: "Employé",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  return `Il y a ${Math.floor(h / 24)} j`;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/connexion?redirect=/admin/dashboard");
  }

  if (profile.role !== "admin" && profile.role !== "super_admin" && profile.role !== "employee") {
    redirect("/");
  }

  const adminName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email ||
    "Admin";

  const adminRole = ROLE_LABELS[profile.role] ?? "Admin";

  // Notifications réelles : commandes récentes + alertes de stock faible
  const [orders, products, logoUrl] = await Promise.all([getAdminOrders(), getAdminProducts(), getShopLogo()]);

  const notifications: AdminNotification[] = orders.slice(0, 4).map((o) => {
    const delivered = o.order_status === "delivered";
    return {
      title: delivered ? "Commande livrée" : "Nouvelle commande",
      desc: `${o.order_number} · ${o.customer_name}`,
      time: relativeTime(o.created_at),
      color: delivered ? "bg-green" : "bg-blue-500",
    };
  });

  for (const p of products.filter((p) => p.stock_quantity < 5 && p.status === "active").slice(0, 2)) {
    notifications.push({
      title: "Stock faible",
      desc: `${p.name} · ${p.stock_quantity} unités restantes`,
      time: "",
      color: "bg-orange-500",
    });
  }

  // Commandes en attente de traitement (badge du menu)
  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;

  return (
    <AdminLayoutClient
      adminName={adminName}
      adminRole={adminRole}
      adminAvatar={profile.avatar_url ?? null}
      logoUrl={logoUrl}
      role={profile.role}
      permissions={profile.permissions ?? {}}
      notifications={notifications}
      pendingOrders={pendingOrders}
    >
      <RealtimeRefresh />
      {children}
    </AdminLayoutClient>
  );
}
