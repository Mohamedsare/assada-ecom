import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/supabase/queries";
import OrderDetailClient from "./OrderDetailClient";

export const metadata: Metadata = { title: "Détail commande" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
