"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  Truck,
  CreditCard,
  BarChart3,
  Star,
  MessageSquare,
  Settings,
  UserCog,
  LayoutTemplate,
  Bell,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  Loader2,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import { signOut } from "@/lib/supabase/actions";
import { hasPermission, isFullAccessRole, type PermissionModuleKey } from "@/lib/permissions";
import AdminSearch from "@/components/admin/AdminSearch";
import type { PermissionMatrix, UserRole } from "@/types";

type NavIcon = typeof LayoutDashboard;
/** `perm` = module requis pour un employé ; `adminOnly` = réservé admin/super_admin. */
type NavLeaf = { href: string; label: string; icon: NavIcon; perm?: PermissionModuleKey; adminOnly?: boolean };
type NavGroup = { label: string; icon: NavIcon; perm?: PermissionModuleKey; adminOnly?: boolean; children: { href: string; label: string }[] };
type NavItem = NavLeaf | NavGroup;

const NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard, perm: "dashboard" },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag, perm: "orders" },
  {
    label: "Produits", icon: Package, perm: "products", children: [
      { href: "/admin/produits", label: "Tous les produits" },
      { href: "/admin/coffrets", label: "Coffrets cadeaux" },
      { href: "/admin/stocks", label: "Stocks" },
    ],
  },
  {
    label: "Catégories", icon: Tag, perm: "categories", children: [
      { href: "/admin/categories", label: "Toutes les catégories" },
      { href: "/admin/marques", label: "Marques" },
    ],
  },
  { href: "/admin/clients", label: "Clients", icon: Users, perm: "clients" },
  { href: "/admin/livreurs", label: "Livreurs", icon: Truck, perm: "delivery" },
  { href: "/admin/livraisons", label: "Livraisons & Tracking", icon: Truck, perm: "delivery" },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard, adminOnly: true },
  { href: "/admin/statistiques", label: "Rapports & Statistiques", icon: BarChart3, perm: "dashboard" },
  { href: "/admin/avis", label: "Avis clients", icon: Star, perm: "products" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, perm: "clients" },
  { href: "/admin/permissions", label: "Permissions", icon: Lock, adminOnly: true },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings, adminOnly: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs admins", icon: UserCog, adminOnly: true },
  { href: "/admin/reglages", label: "Gestion des pages", icon: LayoutTemplate, adminOnly: true },
];

/** Bouton de déconnexion avec état de chargement (soumet la server action du <form> parent). */
function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
      {pending ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}

/** Avatar utilisateur : photo si disponible, sinon initiales sur pastille verte. */
function Avatar({ url, name, size }: { url?: string | null; name: string; size: number }) {
  return (
    <span
      className="rounded-full overflow-hidden flex items-center justify-center bg-green text-[#020B27] font-bold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {url ? (
        <Image src={url} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}

/** Filtre le menu selon le rôle et les permissions de l'employé. */
function visibleNav(role: UserRole, permissions: PermissionMatrix): NavItem[] {
  if (isFullAccessRole(role)) return NAV;
  const profile = { role, permissions };
  return NAV.filter((item) => {
    if (item.adminOnly) return false;
    return item.perm ? hasPermission(profile, item.perm, "view") : false;
  });
}

export interface AdminNotification {
  title: string;
  desc: string;
  time: string;
  color: string;
}

export default function AdminLayoutClient({
  children, adminName, adminRole, adminAvatar = null, role = "admin", permissions = {}, notifications, pendingOrders = 0,
}: {
  children: React.ReactNode;
  adminName: string;
  adminRole: string;
  adminAvatar?: string | null;
  role?: UserRole;
  permissions?: PermissionMatrix;
  notifications: AdminNotification[];
  pendingOrders?: number;
}) {
  const nav = visibleNav(role, permissions);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  // Ferme les menus au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Fonction de rendu (pas un composant) : évite de recréer un composant à chaque render.
  const renderSidebar = (collapsed = false) => (
    <div className="flex flex-col h-full bg-night">
      {/* Logo */}
      <div className={cn("py-3 flex items-center border-b border-white/10", collapsed ? "px-2 justify-center" : "px-4 justify-between")}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="bg-white rounded-lg px-2.5 py-1.5 inline-flex">
              <Image src="/ryta.png" alt="RYTA" width={180} height={120} className="h-11 w-auto object-contain" />
            </span>
          </Link>
        )}
        <div className="flex items-center gap-1">
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={18} />
          </button>
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            className="hidden lg:flex text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto scrollbar-hide">
        {nav.map((item) => {
          const Icon = item.icon;

          // Groupe avec sous-menu
          if ("children" in item) {
            const groupActive = item.children.some((c) => isLinkActive(c.href));
            const open = openGroups[item.label] ?? groupActive;

            // Mode réduit : lien direct vers la première sous-page
            if (collapsed) {
              return (
                <Link
                  key={item.label}
                  href={item.children[0].href}
                  onClick={() => setSidebarOpen(false)}
                  title={item.label}
                  className={cn(
                    "flex items-center justify-center px-0 py-2 rounded-lg mb-0.5 transition-colors text-[13px]",
                    groupActive ? "bg-green text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                </Link>
              );
            }

            return (
              <div key={item.label} className="mb-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(item.label)}
                  aria-expanded={open}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors text-[13px]",
                    groupActive ? "text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown size={13} className={cn("text-gray-500 transition-transform", open && "rotate-180")} />
                </button>
                <div className={cn("overflow-hidden transition-all", open ? "max-h-40 mt-0.5" : "max-h-0")}>
                  <div className="ml-4 pl-3 border-l border-white/10 flex flex-col gap-0.5 py-0.5">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "rounded-lg px-2.5 py-1.5 transition-colors text-[13px]",
                          isLinkActive(c.href) ? "bg-green text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          // Lien simple
          const isActive = isLinkActive(item.href);
          const badge = item.href === "/admin/commandes" && pendingOrders > 0 ? pendingOrders : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg mb-0.5 transition-colors text-[13px]",
                collapsed ? "justify-center px-0 py-2" : "px-2.5 py-1.5",
                isActive ? "bg-green text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && badge !== undefined && (
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center",
                  isActive ? "bg-white/20 text-white" : "bg-[#1d4ed8] text-white"
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Marque bas (carte) */}
      {!collapsed && (
      <div className="px-2.5 pb-3">
        <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-center">
          <div className="flex items-center justify-center mb-1.5">
            <span className="text-white font-bold text-xs">RYTA</span>
          </div>
          <div className="space-y-0.5 text-[10px] text-gray-400">
            <a href={`tel:${SITE_PHONE}`} className="block hover:text-gray-200 transition-colors">
              {SITE_PHONE}
            </a>
            <a href={`mailto:${SITE_EMAIL}`} className="block hover:text-gray-200 transition-colors break-all">
              {SITE_EMAIL}
            </a>
          </div>
        </div>
      </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:flex flex-col shrink-0 transition-all duration-200", collapsed ? "lg:w-16" : "lg:w-52")}>
        {renderSidebar(collapsed)}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            {renderSidebar(false)}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-white text-[#020B27] border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 shrink-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0">
            <Menu size={20} />
          </button>

          {/* Recherche globale asynchrone */}
          <AdminSearch />

          {/* Notifications */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#020B27] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-green text-[#020B27] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">{notifications.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 text-[#020B27]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <p className="font-bold text-sm">Notifications</p>
                  <span className="text-xs text-green font-medium">{notifications.length} récentes</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-8">Aucune notification</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-text-secondary truncate">{n.desc}</p>
                          {n.time && <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/admin/commandes" onClick={() => setNotifOpen(false)} className="block text-center py-2.5 text-sm text-green font-medium hover:bg-gray-50 transition-colors">
                  Voir toutes les commandes
                </Link>
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative shrink-0" ref={userRef}>
            <button
              onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 pr-2 transition-colors"
            >
              <Avatar url={adminAvatar} name={adminName} size={36} />
              <ChevronDown size={15} className="text-gray-400" />
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 text-[#020B27] py-1.5">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 mb-1">
                  <Avatar url={adminAvatar} name={adminName} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#020B27] truncate">{adminName}</p>
                    <p className="text-xs text-text-secondary">{adminRole}</p>
                  </div>
                </div>
                <Link href="/admin/parametres" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <Settings size={15} className="text-gray-500" /> Paramètres
                </Link>
                <Link href="/admin/profil" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <UserCog size={15} className="text-gray-500" /> Mon profil
                </Link>
                <Link href="/" target="_blank" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <ExternalLink size={15} className="text-gray-500" /> Voir la boutique
                </Link>
                <div className="border-t border-gray-50 my-1" />
                <form action={signOut}>
                  <LogoutButton />
                </form>
              </div>
            )}
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
