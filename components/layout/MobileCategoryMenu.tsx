"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AXES, AXIS_FEATURED } from "@/lib/constants";
import CategoryIcon from "@/components/ui/CategoryIcon";
import MenuFeaturedCard from "@/components/layout/MenuFeaturedCard";

/**
 * Accordéon catégories pour le tiroir mobile (2 niveaux : axe → catégories).
 * `onNavigate` ferme le tiroir après un clic sur un lien.
 */
export default function MobileCategoryMenu({ onNavigate }: { onNavigate: () => void }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <div className="border-b border-gray-100">
      {AXES.map((axis) => {
        const expanded = openSlug === axis.slug;
        const featured = AXIS_FEATURED[axis.slug];
        return (
          <div key={axis.slug} className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => setOpenSlug(expanded ? null : axis.slug)}
              aria-expanded={expanded}
              className="w-full flex items-center justify-between px-5 py-3.5 text-base font-semibold text-[#020B27] hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2.5 whitespace-nowrap">
                <CategoryIcon slug={axis.slug} size={18} className="text-[#B8925A] shrink-0" />
                {axis.name}
              </span>
              <ChevronDown
                size={18}
                className={cn("text-gray-400 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>

            <div
              className={cn(
                "overflow-y-auto transition-all duration-300 bg-gray-50/60",
                expanded ? "max-h-[60vh]" : "max-h-0"
              )}
            >
              <Link
                href={`/boutique?categorie=${axis.slug}`}
                onClick={onNavigate}
                className="block pl-12 pr-5 py-2.5 text-[15px] font-medium text-green hover:underline"
              >
                Tout {axis.name}
              </Link>
              {axis.children.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/boutique?categorie=${cat.slug}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 pl-12 pr-5 py-2.5 text-[15px] text-text-secondary hover:text-green hover:bg-white transition-colors"
                >
                  <CategoryIcon slug={cat.slug} size={15} className="text-[#B8925A]/70 shrink-0" />
                  {cat.name}
                </Link>
              ))}

              {/* Visuels de l'axe (éditables — « Images liens ») */}
              {featured && (
                <div className="grid grid-cols-2 gap-3 px-5 pt-3 pb-5">
                  {featured.map((item) => (
                    <MenuFeaturedCard key={item.href} item={item} onClick={onNavigate} className="aspect-3/4 w-full" />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
