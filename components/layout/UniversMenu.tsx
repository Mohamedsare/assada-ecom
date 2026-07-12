"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UNIVERS_LINKS, UNIVERS_FEATURED } from "@/lib/constants";
import MenuFeaturedCard from "@/components/layout/MenuFeaturedCard";

/**
 * Méga-menu desktop « L'univers RYTA » (façon apia) : panneau pleine largeur au survol/focus.
 * À gauche les liens institutionnels (Magasin, Qui sommes-nous ?, Contact), à droite deux visuels.
 * Rendu uniquement en ≥ lg.
 */
export default function UniversMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const openMenu = () => { clearClose(); setOpen(true); };
  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => clearClose(), []);

  return (
    <div
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={openMenu}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-[#2F9E44] hover:bg-gray-50",
          open ? "text-[#2F9E44] bg-[#2F9E44]/10" : "text-gray-600"
        )}
      >
        L&apos;univers RYTA
        <ChevronDown size={15} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Panneau pleine largeur */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full bg-white text-[#0A2A52] shadow-2xl border-t border-gray-100",
          "transition-all duration-200 origin-top",
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1 pointer-events-none"
        )}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        role="menu"
        aria-label="L'univers RYTA"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-start justify-between gap-10">
          {/* Liens */}
          <div className="min-w-0">
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[#2F9E44]">L&apos;univers RYTA</p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-5 max-w-md">
              {UNIVERS_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-[#0A2A52] hover:text-green transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Visuels */}
          <div className="flex shrink-0 gap-4">
            {UNIVERS_FEATURED.map((item) => (
              <MenuFeaturedCard key={item.href} item={item} onClick={() => setOpen(false)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
