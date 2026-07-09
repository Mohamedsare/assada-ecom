"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Colonne de footer : accordéon repliable sur mobile (titre + chevron),
 * toujours dépliée en 3 colonnes sur desktop (md+).
 */
export default function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 md:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-4 md:py-0 md:pointer-events-none"
      >
        <h3 className="text-white text-xl font-bold text-left">{title}</h3>
        <ChevronDown
          size={20}
          className={cn(
            "shrink-0 text-white/70 transition-transform duration-300 md:hidden",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Animation de hauteur via grid-rows ; forcée ouverte sur desktop. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-6 md:pb-0 md:pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
