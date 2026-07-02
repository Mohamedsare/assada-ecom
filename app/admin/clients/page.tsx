import type { Metadata } from "next";
import { getAdminProfiles, getCustomerOrderStats } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import ClientsContent from "./ClientsContent";

export const metadata: Metadata = { title: "Gestion clients" };

export default async function AdminClientsPage() {
  await requirePermission("clients", "view");
  const [profiles, stats] = await Promise.all([
    getAdminProfiles(),
    getCustomerOrderStats(),
  ]);
  const customers = profiles.filter((p) => p.role === "customer");
  return <ClientsContent customers={customers} stats={stats} />;
}
