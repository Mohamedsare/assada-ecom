"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AXIS_FEATURED, type Axis } from "@/lib/constants";
import CategoryIcon from "@/components/ui/CategoryIcon";
import MenuFeaturedCard from "@/components/layout/MenuFeaturedCard";

/**
 * Méga-menu desktop d'un grand axe (Beauté / Compléments alimentaires / Produits locaux).
 * Déclencheur = nom de l'axe ; panneau pleine largeur listant ses catégories
 * (et leurs sous-catégories quand elles existent, ex. Beauté). Même comportement
 * hover/focus/Échap que le menu « Boutique ». Rendu uniquement en ≥ lg.
 */
export default function AxisMegaMenu({
  axis,
  active,
  label,
}: {
  axis: Axis;
  active: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featured = AXIS_FEATURED[axis.slug];

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
      <Link
        href={`/boutique?categorie=${axis.slug}`}
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={openMenu}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors hover:text-[#B8925A] hover:bg-gray-50",
          active || open ? "text-[#B8925A] bg-[#B8925A]/10" : "text-gray-600"
        )}
      >
        {label ?? axis.name}
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
        aria-label={`Catégories — ${axis.name}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 max-h-[85vh] overflow-y-auto">
          <Link
            href={`/boutique?categorie=${axis.slug}`}
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 mb-4 text-lg font-bold text-[#020B27] hover:text-green transition-colors"
          >
            <CategoryIcon slug={axis.slug} size={20} className="text-[#B8925A]" />
            {axis.name}
            <ArrowRight size={17} className="text-[#B8925A]" />
          </Link>

          <div className="flex items-start justify-between gap-10">
            <div
              className={cn(
                "min-w-0 flex-1 grid gap-x-5 gap-y-4",
                featured ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
              )}
            >
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

            {/* Visuels de l'axe (éditables — « Images liens ») */}
            {featured && (
              <div className="flex shrink-0 gap-4">
                {featured.map((item) => (
                  <MenuFeaturedCard key={item.href} item={item} onClick={() => setOpen(false)} className="h-52 w-40 shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Paiement à la livraison • Livraison partout au Maroc en 24–72h
            </p>
            <Link
              href={`/boutique?categorie=${axis.slug}`}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:gap-2.5 transition-all"
            >
              Voir tout {axis.name} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
