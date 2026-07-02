import type { Metadata } from "next";
import { getAllCategories, getAllBrands } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NouveauProduitPage() {
  await requirePermission("products", "create");
  const [categories, brands] = await Promise.all([getAllCategories(), getAllBrands()]);
  return <ProductForm categories={categories} brands={brands} />;
}
