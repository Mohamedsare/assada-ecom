import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrderById, getDeliveryAgents } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import OrderDetailClient from "./OrderDetailClient";

export const metadata: Metadata = { title: "Détail commande" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("orders", "view");
  const { id } = await params;
  const [order, agents] = await Promise.all([getAdminOrderById(id), getDeliveryAgents()]);
  if (!order) notFound();

  return <OrderDetailClient order={order} agents={agents} />;
}
