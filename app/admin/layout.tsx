import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/queries";
import AdminLayoutClient from "./AdminLayoutClient";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  super_admin: "Super Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/connexion?redirect=/admin/dashboard");
  }

  if (profile.role !== "admin" && profile.role !== "super_admin") {
    redirect("/");
  }

  const adminName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.email ||
    "Admin";

  const adminRole = ROLE_LABELS[profile.role] ?? "Admin";

  return (
    <AdminLayoutClient adminName={adminName} adminRole={adminRole}>
      {children}
    </AdminLayoutClient>
  );
}
