import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/supabase/queries";
import CommandesContent from "./CommandesContent";

export const metadata: Metadata = { title: "Gestion commandes" };

export default async function AdminCommandesPage() {
  const orders = await getAdminOrders();
  return <CommandesContent initialOrders={orders} />;
}
