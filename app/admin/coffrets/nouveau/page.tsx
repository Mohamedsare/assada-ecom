import type { Metadata } from "next";
import { getAllCategories, getAdminProducts } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import PackForm from "../PackForm";

export const metadata: Metadata = { title: "Nouveau coffret" };

export default async function NouveauCoffretPage() {
  await requirePermission("products", "create");
  const [categories, products] = await Promise.all([
    getAllCategories(),
    getAdminProducts(),
  ]);
  return <PackForm categories={categories} products={products} />;
}
