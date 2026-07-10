"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AXES } from "@/lib/constants";
import CategoryIcon from "@/components/ui/CategoryIcon";

/**
 * Méga-menu desktop « Boutique » façon apia : panneau pleine largeur au survol/focus.
 * Rail gauche = les 3 grands axes (Beauté, Compléments, Produits locaux) ; le survol d'un
 * axe affiche ses catégories (et leurs sous-catégories) dans le panneau de droite.
 * Rendu uniquement en ≥ lg (le mobile utilise MobileCategoryMenu).
 */
export default function CategoryMegaMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const [axisIdx, setAxisIdx] = useState(0);
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

  const axis = AXES[Math.min(axisIdx, AXES.length - 1)];

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
        <div className="max-w-7xl mx-auto px-6 py-5 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-[240px_1fr] gap-6">
            {/* Rail gauche — les 3 axes */}
            <div className="border-r border-gray-100 pr-4">
              <ul className="space-y-1">
                {AXES.map((a, i) => (
                  <li key={a.slug}>
                    <Link
                      href={`/boutique?categorie=${a.slug}`}
                      onMouseEnter={() => setAxisIdx(i)}
                      onFocus={() => setAxisIdx(i)}
                      onClick={() => setOpen(false)}
                      role="menuitem"
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                        i === axisIdx ? "bg-[#B8925A]/10 text-[#B8925A]" : "text-[#020B27] hover:bg-gray-50"
                      )}
                    >
                      <CategoryIcon
                        slug={a.slug}
                        size={18}
                        className={cn("shrink-0", i === axisIdx ? "text-[#B8925A]" : "text-text-secondary")}
                      />
                      <span className="flex-1">{a.name}</span>
                      <ChevronRight
                        size={15}
                        className={cn("shrink-0 transition-opacity", i === axisIdx ? "opacity-100 text-[#B8925A]" : "opacity-0 group-hover:opacity-50")}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Panneau droit — catégories de l'axe survolé */}
            <div>
              <Link
                href={`/boutique?categorie=${axis.slug}`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 mb-4 text-lg font-bold text-[#020B27] hover:text-green transition-colors"
              >
                {axis.name}
                <ArrowRight size={17} className="text-[#B8925A]" />
              </Link>

              <div className="grid grid-cols-3 gap-x-5 gap-y-4">
                {axis.children.map((cat) => (
                  <div key={cat.slug}>
                    <Link
                      href={`/boutique?categorie=${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-2 mb-1.5 font-semibold text-[#020B27] hover:text-green transition-colors"
                    >
                      <CategoryIcon slug={cat.slug} size={15} className="text-[#B8925A] shrink-0 group-hover:text-green transition-colors" />
                      <span className="text-[13px]">{cat.name}</span>
                    </Link>
                    {cat.children && cat.children.length > 0 && (
                      <ul className="space-y-0.5 pl-6">
                        {cat.children.map((leaf) => (
                          <li key={leaf.slug}>
                            <Link
                              href={`/boutique?categorie=${leaf.slug}`}
                              onClick={() => setOpen(false)}
                              role="menuitem"
                              className="block text-xs text-text-secondary hover:text-green hover:translate-x-0.5 transition-all"
                            >
                              {leaf.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Paiement à la livraison • Livraison partout au Maroc en 24–72h, gratuite dès 300 DH
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
