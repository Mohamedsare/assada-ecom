import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import CommandesContent from "./CommandesContent";

export const metadata: Metadata = { title: "Gestion commandes" };

export default async function AdminCommandesPage() {
  await requirePermission("orders", "view");
  const orders = await getAdminOrders();
  return <CommandesContent initialOrders={orders} />;
}
