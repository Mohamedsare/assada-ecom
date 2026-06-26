"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/compte", label: "Mon compte", icon: User },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/adresses", label: "Mes adresses", icon: MapPin },
  { href: "/compte/favoris", label: "Mes favoris", icon: Heart },
  { href: "/compte/parametres", label: "Paramètres", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("Mon compte");
  const [email, setEmail] = useState("");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("first_name, last_name, email").eq("id", user.id).single();
      if (data) {
        const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
        setDisplayName(name || user.email?.split("@")[0] || "Compte");
        setEmail(data.email ?? user.email ?? "");
        const parts = [data.first_name, data.last_name].filter(Boolean);
        setInitials(parts.length > 0 ? parts.map((p: string) => p[0]).join("").toUpperCase().slice(0, 2) : "?");
      }
    }
    loadUser();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-[#020B27] to-[#0F172A] p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#16A34A] rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold truncate">{displayName}</p>
            <p className="text-gray-400 text-xs truncate">{email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5 transition-colors",
                isActive
                  ? "bg-[#16A34A]/10 text-[#16A34A]"
                  : "text-[#64748B] hover:bg-gray-50 hover:text-[#0F172A]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <ChevronRight size={14} className={isActive ? "text-[#16A34A]" : "text-gray-300"} />
            </Link>
          );
        })}

        <div className="border-t border-gray-100 mt-2 pt-2">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#EF4444] hover:bg-red-50 transition-colors"
            >
              <LogOut size={17} />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
