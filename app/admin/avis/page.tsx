import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import AvisContent from "./AvisContent";

export const metadata: Metadata = { title: "Avis clients" };
export const dynamic = "force-dynamic";

export default async function AdminAvisPage() {
  await requirePermission("products", "view");
  const reviews = await getAdminReviews();
  return <AvisContent reviews={reviews} />;
}
