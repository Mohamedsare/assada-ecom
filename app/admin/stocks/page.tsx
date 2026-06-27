import type { Metadata } from "next";
import { getAdminProducts } from "@/lib/supabase/queries";
import StocksContent from "./StocksContent";

export const metadata: Metadata = { title: "Gestion des stocks" };
export const dynamic = "force-dynamic";

export default async function AdminStocksPage() {
  const products = await getAdminProducts();
  return <StocksContent products={products} />;
}
