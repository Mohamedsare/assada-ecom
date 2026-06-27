import type { Metadata } from "next";
import { getAdminReviews } from "@/lib/supabase/queries";
import AvisContent from "./AvisContent";

export const metadata: Metadata = { title: "Avis clients" };
export const dynamic = "force-dynamic";

export default async function AdminAvisPage() {
  const reviews = await getAdminReviews();
  return <AvisContent reviews={reviews} />;
}
