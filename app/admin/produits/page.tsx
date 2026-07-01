import type { Metadata } from "next";
import { getAdminProducts, getAllCategories, getAllBrands } from "@/lib/supabase/queries";
import ProductsTable from "./ProductsTable";

export const metadata: Metadata = { title: "Gestion produits" };

export default async function AdminProduitsPage() {
  const [products, categories, brands] = await Promise.all([
    getAdminProducts(),
    getAllCategories(),
    getAllBrands(),
  ]);

  return <ProductsTable products={products} categories={categories} brands={brands} />;
}
