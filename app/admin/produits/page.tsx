import type { Metadata } from "next";
import { getAdminProducts, getAllCategories, getAllBrands } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import ProductsTable from "./ProductsTable";

export const metadata: Metadata = { title: "Gestion produits" };

export default async function AdminProduitsPage() {
  await requirePermission("products", "view");
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(),
    getAllCategories(),
    getAllBrands(),
  ]);

  return <ProductsTable products={products} categories={categories} brands={brands} />;
}
