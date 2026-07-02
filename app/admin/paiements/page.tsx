import type { Metadata } from "next";
import { getAdminPayments } from "@/lib/supabase/queries";
import { requireAdmin } from "@/lib/supabase/guards";
import PaiementsContent from "./PaiementsContent";

export const metadata: Metadata = { title: "Paiements" };
export const dynamic = "force-dynamic";

export default async function AdminPaiementsPage() {
  await requireAdmin();
  const payments = await getAdminPayments();
  return <PaiementsContent payments={payments} />;
}
