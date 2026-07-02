import type { Metadata } from "next";
import { getAllCategories, getProductCountByCategory } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import CategoriesContent from "./CategoriesContent";

export const metadata: Metadata = { title: "Gestion catégories" };

export default async function AdminCategoriesPage() {
  await requirePermission("categories", "view");
  const [categories, counts] = await Promise.all([
    getAllCategories(),
    getProductCountByCategory(),
  ]);
  return <CategoriesContent categories={categories} counts={counts} />;
}
