import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/supabase/guards";
import { isFullAccessRole, hasPermission, PERMISSION_MODULES } from "@/lib/permissions";

/**
 * Point d'entrée de l'admin : route chaque utilisateur vers une page qu'il peut voir.
 * Admin/super_admin → dashboard. Employé → première page autorisée par ses permissions.
 * (Sert aussi de destination de repli des gardes pour éviter les boucles de redirection.)
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await requireStaff();

  if (isFullAccessRole(profile.role)) redirect("/admin/dashboard");

  // Employé : première page dont il a le droit de vue.
  const first = PERMISSION_MODULES.find((m) => m.href && hasPermission(profile, m.key, "view"));
  redirect(first?.href ?? "/");
}
