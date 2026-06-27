"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Award,
  Users,
  Truck,
  CreditCard,
  Ticket,
  Boxes,
  BarChart3,
  Star,
  MessageSquare,
  Settings,
  UserCog,
  Store,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import { signOut } from "@/lib/supabase/actions";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; badge?: number; chevron?: boolean }[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag, badge: 24 },
  { href: "/admin/produits", label: "Produits", icon: Package, chevron: true },
  { href: "/admin/categories", label: "Catégories", icon: Tag, chevron: true },
  { href: "/admin/marques", label: "Marques", icon: Award },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/livraisons", label: "Livreurs & Tracking", icon: Truck },
  { href: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { href: "/admin/promotions", label: "Promotions & Coupons", icon: Ticket },
  { href: "/admin/stocks", label: "Stocks", icon: Boxes },
  { href: "/admin/statistiques", label: "Rapports & Statistiques", icon: BarChart3 },
  { href: "/admin/avis", label: "Avis clients", icon: Star },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
  { href: "/admin/utilisateurs", label: "Utilisateurs admins", icon: UserCog },
  { href: "/admin/reglages", label: "Réglages boutique", icon: Store },
];

export interface AdminNotification {
  title: string;
  desc: string;
  time: string;
  color: string;
}

export default function AdminLayoutClient({
  children, adminName, adminRole, notifications,
}: {
  children: React.ReactNode;
  adminName: string;
  adminRole: string;
  notifications: AdminNotification[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Ferme les menus au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/admin/produits?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-night">
      {/* Logo */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center">
          <Image src="/logo1.png" alt="Odm's Shopping" width={120} height={80} className="h-9 w-auto object-contain" />
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-2 overflow-y-auto scrollbar-hide">
        {NAV.map(({ href, label, icon: Icon, badge, chevron }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg mb-0.5 transition-colors text-[13px]",
                isActive ? "bg-green text-white font-medium" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center",
                  isActive ? "bg-white/20 text-white" : "bg-[#1d4ed8] text-white"
                )}>
                  {badge}
                </span>
              )}
              {chevron && <ChevronDown size={13} className="text-gray-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Marque bas (carte) */}
      <div className="px-2.5 pb-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center shrink-0">
              <Image src="/logo1.png" alt="" width={48} height={32} className="h-5 w-auto object-contain" />
            </div>
            <span className="text-white font-bold text-xs">Odm&apos;s Shopping</span>
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
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-52 flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="bg-night text-white px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0">
            <Menu size={20} />
          </button>

          {/* Titre + welcome */}
          <div className="hidden md:block shrink-0">
            <h1 className="font-bold text-lg flex items-center gap-2 leading-none">
              Tableau de bord
              <span className="w-5 h-5 bg-green rounded-full flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Bienvenue, Administrateur 👋</p>
          </div>

          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2 focus-within:border-green-light transition-colors">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (produit, commande, client...)"
                className="bg-transparent text-sm outline-none flex-1 text-white placeholder-gray-400 min-w-0"
              />
            </div>
          </form>

          {/* Voir boutique */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 border border-white/20 hover:bg-white/10 px-3 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
          >
            Voir la boutique <ExternalLink size={14} />
          </Link>

          {/* Notifications */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((v) => !v); setUserOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-gray-300" />
              {notifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-green text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{notifications.length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-[#0F172A]">
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
              className="flex items-center gap-2 hover:bg-white/10 rounded-xl p-1 pr-2 transition-colors"
            >
              <div className="w-9 h-9 bg-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-left leading-none">
                <p className="text-sm font-medium">{adminName}</p>
                <p className="text-gray-400 text-xs mt-0.5">{adminRole}</p>
              </div>
              <ChevronDown size={15} className="hidden md:block text-gray-400" />
            </button>
            {userOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-[#0F172A] py-1.5">
                <Link href="/admin/parametres" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <Settings size={15} className="text-gray-500" /> Paramètres
                </Link>
                <Link href="/admin/utilisateurs" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <UserCog size={15} className="text-gray-500" /> Mon profil
                </Link>
                <Link href="/" target="_blank" onClick={() => setUserOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <ExternalLink size={15} className="text-gray-500" /> Voir la boutique
                </Link>
                <div className="border-t border-gray-50 my-1" />
                <form action={signOut}>
                  <button
                    type="submit"
                    onClick={() => setUserOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={15} /> Déconnexion
                  </button>
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
