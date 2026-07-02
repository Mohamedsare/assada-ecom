import { getAdminProfiles } from "@/lib/supabase/queries";
import { requireAdmin } from "@/lib/supabase/guards";
import PermissionsContent from "./PermissionsContent";

export const metadata = { title: "Permissions" };
export const dynamic = "force-dynamic";

export default async function AdminPermissionsPage() {
  await requireAdmin();
  const profiles = await getAdminProfiles();

  const employees = profiles.filter((p) => p.role === "employee");
  const admins = profiles.filter((p) => p.role === "admin" || p.role === "super_admin");
  const customers = profiles.filter((p) => p.role === "customer");

  return <PermissionsContent employees={employees} admins={admins} customers={customers} />;
}
