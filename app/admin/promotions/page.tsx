import type { Metadata } from "next";
import { getAdminCoupons } from "@/lib/supabase/queries";
import PromotionsContent from "./PromotionsContent";

export const metadata: Metadata = { title: "Promotions & Coupons" };
export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const coupons = await getAdminCoupons();
  return <PromotionsContent coupons={coupons} />;
}
