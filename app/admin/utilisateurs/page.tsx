import type { Metadata } from "next";
import { getAdminProfiles, getCurrentProfile } from "@/lib/supabase/queries";
import UsersContent from "./UsersContent";

export const metadata: Metadata = { title: "Utilisateurs admins" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [profiles, current] = await Promise.all([getAdminProfiles(), getCurrentProfile()]);
  const staff = profiles.filter((p) => p.role !== "customer");
  return <UsersContent staff={staff} currentUserId={current?.id ?? ""} />;
}
