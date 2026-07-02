import type { PermissionMatrix, Profile, UserRole } from "@/types";

/**
 * Système de permissions (spec ASSADA § Permissions).
 * Fichier pur (aucun import serveur) → utilisable côté client et serveur.
 * L'application des permissions côté backend se fait via lib/supabase/guards.ts.
 */

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete", "export"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Voir",
  create: "Créer",
  edit: "Modifier",
  delete: "Supprimer",
  export: "Exporter",
};

/** Modules de l'admin. `href` = null pour les modules transverses (factures, exports). */
export const PERMISSION_MODULES = [
  { key: "dashboard", label: "Tableau de bord", href: "/admin/dashboard" },
  { key: "orders", label: "Commandes", href: "/admin/commandes" },
  { key: "products", label: "Produits", href: "/admin/produits" },
  { key: "categories", label: "Catégories", href: "/admin/categories" },
  { key: "brands", label: "Marques", href: "/admin/marques" },
  { key: "clients", label: "Clients", href: "/admin/clients" },
  { key: "delivery", label: "Livreurs", href: "/admin/livreurs" },
  { key: "settings_shop", label: "Réglages boutique", href: "/admin/reglages" },
  { key: "permissions", label: "Permissions", href: "/admin/permissions" },
  { key: "settings", label: "Paramètres", href: "/admin/parametres" },
  { key: "invoices", label: "Factures", href: null },
  { key: "exports", label: "Exports", href: null },
] as const;

export type PermissionModuleKey = (typeof PERMISSION_MODULES)[number]["key"];

/** Permissions sensibles (drapeaux booléens hors matrice module × action). */
export const SENSITIVE_PERMISSIONS = [
  { key: "view_client_phone", label: "Voir le téléphone client" },
  { key: "view_revenue", label: "Voir le chiffre d'affaires" },
  { key: "view_profit", label: "Voir le bénéfice" },
  { key: "edit_price", label: "Modifier les prix" },
  { key: "cancel_order", label: "Annuler une commande" },
  { key: "generate_invoice", label: "Générer une facture" },
  { key: "mark_delivered", label: "Marquer comme livrée" },
  { key: "export_clients", label: "Exporter les clients" },
] as const;

export type SensitivePermissionKey = (typeof SENSITIVE_PERMISSIONS)[number]["key"];

const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/** Un rôle disposant de tous les droits sans matrice (admin, super_admin). */
export function isFullAccessRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/** Vérifie un droit module × action pour un profil. */
export function hasPermission(
  profile: Pick<Profile, "role" | "permissions"> | null | undefined,
  module: PermissionModuleKey,
  action: PermissionAction = "view",
): boolean {
  if (!profile) return false;
  if (isFullAccessRole(profile.role)) return true;
  if (profile.role !== "employee") return false;
  return Boolean(profile.permissions?.[module]?.[action]);
}

/** Vérifie une permission sensible pour un profil. */
export function hasSensitive(
  profile: Pick<Profile, "role" | "permissions"> | null | undefined,
  key: SensitivePermissionKey,
): boolean {
  if (!profile) return false;
  if (isFullAccessRole(profile.role)) return true;
  if (profile.role !== "employee") return false;
  return Boolean(profile.permissions?.sensitive?.[key]);
}

/** Matrice par défaut d'un nouvel employé : lecture seule des modules courants. */
export function defaultEmployeePermissions(): PermissionMatrix {
  return {
    dashboard: { view: true },
    orders: { view: true, edit: true },
    products: { view: true },
    clients: { view: true },
    delivery: { view: true },
    sensitive: { view_client_phone: true, generate_invoice: true, mark_delivered: true },
  };
}
