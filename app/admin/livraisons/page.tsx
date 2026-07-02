import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import LivraisonsContent from "./LivraisonsContent";

export const metadata: Metadata = { title: "Livraisons" };
export const dynamic = "force-dynamic";

export default async function AdminLivraisonsPage() {
  await requirePermission("delivery", "view");
  const orders = await getAdminOrders();
  return <LivraisonsContent orders={orders} />;
}
