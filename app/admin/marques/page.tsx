import type { Metadata } from "next";
import { getAllBrands, getProductCountByBrand } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import MarquesContent from "./MarquesContent";

export const metadata: Metadata = { title: "Gestion marques" };

export default async function AdminMarquesPage() {
  await requirePermission("brands", "view");
  const [brands, counts] = await Promise.all([
    getAllBrands(),
    getProductCountByBrand(),
  ]);
  return <MarquesContent brands={brands} counts={counts} />;
}
