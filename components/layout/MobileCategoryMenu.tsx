"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_TREE } from "@/lib/constants";
import CategoryIcon from "@/components/ui/CategoryIcon";

/**
 * Accordéon catégories pour le tiroir mobile (2 niveaux).
 * `onNavigate` ferme le tiroir après un clic sur un lien.
 */
export default function MobileCategoryMenu({ onNavigate }: { onNavigate: () => void }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <div className="border-b border-gray-100">
      <Link
        href="/boutique"
        onClick={onNavigate}
        className="flex items-center justify-between px-5 py-4 text-sm font-bold uppercase tracking-wide text-[#020B27] hover:bg-gray-50 transition-colors"
      >
        Boutique — Tout voir
      </Link>

      {CATEGORY_TREE.map((branch) => {
        const expanded = openSlug === branch.slug;
        return (
          <div key={branch.slug} className="border-t border-gray-100">
            <button
              type="button"
              onClick={() => setOpenSlug(expanded ? null : branch.slug)}
              aria-expanded={expanded}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#020B27] hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <CategoryIcon slug={branch.slug} size={18} className="text-[#B8925A] shrink-0" />
                {branch.name}
              </span>
              <ChevronDown
                size={18}
                className={cn("text-gray-400 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 bg-gray-50/60",
                expanded ? "max-h-[520px]" : "max-h-0"
              )}
            >
              <Link
                href={`/boutique?categorie=${branch.slug}`}
                onClick={onNavigate}
                className="block pl-12 pr-5 py-2.5 text-[13px] font-medium text-green hover:underline"
              >
                Tout {branch.name}
              </Link>
              {branch.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/boutique?categorie=${child.slug}`}
                  onClick={onNavigate}
                  className="block pl-12 pr-5 py-2.5 text-[13px] text-text-secondary hover:text-green hover:bg-white transition-colors"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
