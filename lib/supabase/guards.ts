import { redirect } from "next/navigation";
import { getCurrentProfile } from "./queries";
import {
  hasPermission, hasSensitive, isFullAccessRole,
  type PermissionAction, type PermissionModuleKey, type SensitivePermissionKey,
} from "@/lib/permissions";
import type { Profile } from "@/types";

/** Profil courant s'il fait partie du staff (admin/super_admin/employee), sinon redirige. */
export async function requireStaff(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion?redirect=/admin/dashboard");
  if (!isFullAccessRole(profile.role) && profile.role !== "employee") redirect("/");
  return profile;
}

/** Exige un accès complet (admin/super_admin) — pour Permissions, Utilisateurs, Réglages. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireStaff();
  // Redirige vers l'index admin (qui route vers une page autorisée) — évite toute boucle.
  if (!isFullAccessRole(profile.role)) redirect("/admin");
  return profile;
}

/** Exige un droit module × action ; redirige vers une page autorisée si refusé. */
export async function requirePermission(
  module: PermissionModuleKey,
  action: PermissionAction = "view",
): Promise<Profile> {
  const profile = await requireStaff();
  if (!hasPermission(profile, module, action)) redirect("/admin");
  return profile;
}

/** Version « action serveur » : renvoie une erreur plutôt que de rediriger. */
export async function ensurePermission(
  module: PermissionModuleKey,
  action: PermissionAction = "view",
): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (!isFullAccessRole(profile.role) && profile.role !== "employee")) {
    return { ok: false, error: "Accès refusé." };
  }
  if (!hasPermission(profile, module, action)) {
    return { ok: false, error: "Vous n'avez pas la permission d'effectuer cette action." };
  }
  return { ok: true, profile };
}

/** Version « action serveur » pour une permission sensible. */
export async function ensureSensitive(
  key: SensitivePermissionKey,
): Promise<{ ok: true; profile: Profile } | { ok: false; error: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (!isFullAccessRole(profile.role) && profile.role !== "employee")) {
    return { ok: false, error: "Accès refusé." };
  }
  if (!hasSensitive(profile, key)) {
    return { ok: false, error: "Vous n'avez pas la permission d'effectuer cette action." };
  }
  return { ok: true, profile };
}
