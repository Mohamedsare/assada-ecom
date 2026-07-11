import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminPackById, getAllCategories, getAdminProducts } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import PackForm from "../../PackForm";

export const metadata: Metadata = { title: "Modifier le coffret" };

export default async function ModifierCoffretPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("products", "edit");
  const { id } = await params;
  const [pack, categories, products] = await Promise.all([
    getAdminPackById(id),
    getAllCategories(),
    getAdminProducts(),
  ]);

  if (!pack) notFound();

  return <PackForm pack={pack} categories={categories} products={products} />;
}
