"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { UNIVERS_LINKS, UNIVERS_FEATURED } from "@/lib/constants";
import MenuFeaturedCard from "@/components/layout/MenuFeaturedCard";

/**
 * Accordéon « L'univers RYTA » pour le tiroir mobile : liens institutionnels + 2 visuels.
 * `onNavigate` ferme le tiroir après un clic sur un lien.
 */
export default function MobileUniversMenu({ onNavigate }: { onNavigate: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-3.5 text-base font-semibold text-[#0A2A52] hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-[#2F9E44] shrink-0" />
          L&apos;univers RYTA
        </span>
        <ChevronDown
          size={18}
          className={cn("text-gray-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 bg-gray-50/60",
          open ? "max-h-160" : "max-h-0"
        )}
      >
        {UNIVERS_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="block pl-12 pr-5 py-2.5 text-[15px] text-text-secondary hover:text-green hover:bg-white transition-colors"
          >
            {link.label}
          </Link>
        ))}

        {/* Visuels */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-3 pb-5">
          {UNIVERS_FEATURED.map((item) => (
            <MenuFeaturedCard key={item.href} item={item} onClick={onNavigate} className="aspect-3/4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
