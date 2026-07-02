"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_TREE } from "@/lib/constants";
import CategoryIcon from "@/components/ui/CategoryIcon";

/**
 * Méga-menu desktop « Boutique » : panneau pleine largeur au survol/focus,
 * listant les catégories de tête et leurs sous-catégories.
 * Rendu uniquement en ≥ lg (le mobile utilise MobileCategoryMenu).
 */
export default function CategoryMegaMenu({ active }: { active: boolean }) {
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

  // Fermeture au clavier (Échap)
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
      <Link
        href="/boutique"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={openMenu}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-[#B8925A] hover:bg-gray-50",
          active || open ? "text-[#B8925A] bg-[#B8925A]/10" : "text-gray-600"
        )}
      >
        Boutique
        <ChevronDown size={15} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </Link>

      {/* Panneau pleine largeur (le header sticky est le bloc conteneur) */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full bg-white text-[#020B27] shadow-2xl border-t border-gray-100",
          "transition-all duration-200 origin-top",
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-1 pointer-events-none"
        )}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        role="menu"
        aria-label="Catégories de la boutique"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-5 gap-x-5 gap-y-3.5">
            {CATEGORY_TREE.map((branch) => (
              <div key={branch.slug}>
                <Link
                  href={`/boutique?categorie=${branch.slug}`}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-2 mb-1.5 font-bold text-[#020B27] hover:text-green transition-colors"
                >
                  <CategoryIcon slug={branch.slug} size={16} className="text-[#B8925A] shrink-0 group-hover:text-green transition-colors" />
                  <span className="text-[13px]">{branch.name}</span>
                </Link>
                <ul className="space-y-0.5">
                  {branch.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/boutique?categorie=${child.slug}`}
                        onClick={() => setOpen(false)}
                        role="menuitem"
                        className="block text-xs text-text-secondary hover:text-green hover:translate-x-0.5 transition-all"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Paiement à la livraison • Livraison partout à Casablanca
            </p>
            <Link
              href="/boutique"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:gap-2.5 transition-all"
            >
              Voir toute la boutique <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
