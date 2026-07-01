import type { Metadata } from "next";
import { getAdminProfiles, getCustomerOrderStats } from "@/lib/supabase/queries";
import ClientsContent from "./ClientsContent";

export const metadata: Metadata = { title: "Gestion clients" };

export default async function AdminClientsPage() {
  const [profiles, stats] = await Promise.all([
    getAdminProfiles(),
    getCustomerOrderStats(),
  ]);
  const customers = profiles.filter((p) => p.role === "customer");
  return <ClientsContent customers={customers} stats={stats} />;
}
