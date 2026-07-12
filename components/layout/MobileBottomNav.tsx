"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Store, Gift, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

const ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/boutique", label: "Boutique", icon: Store },
  { href: "/coffrets-cadeaux", label: "Coffrets", icon: Gift },
  { href: "/panier", label: "Panier", icon: ShoppingCart, badge: true },
  { href: "/compte", label: "Compte", icon: User },
];

/**
 * Barre de navigation mobile toujours fixée en bas de l'écran.
 * Elle reste visible en permanence (aucun masquage au scroll) — contrairement
 * au header qui glisse hors de l'écran en descendant. Voir Header.tsx.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // Valeur dérivée (et non la fonction) pour que le badge se mette à jour
  // dès que le panier change. Voir aussi Header.tsx.
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A2A52] border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation mobile"
    >
      <div className="grid grid-cols-5 h-16">
        {ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 relative transition-colors active:scale-95",
                isActive ? "text-[#2F9E44]" : "text-gray-400"
              )}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
                {badge && mounted && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#2F9E44] text-[#0A2A52] text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#2F9E44] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
