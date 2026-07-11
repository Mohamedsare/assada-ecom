import type { Metadata } from "next";
import { getAdminPacks } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import PacksTable from "./PacksTable";

export const metadata: Metadata = { title: "Coffrets cadeaux" };

export default async function AdminCoffretsPage() {
  await requirePermission("products", "view");
  const packs = await getAdminPacks();
  return <PacksTable packs={packs} />;
}
