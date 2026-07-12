"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="not-prose space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors"
            >
              <span className="font-semibold text-[#0A2A52] text-sm md:text-base">{item.q}</span>
              <ChevronDown
                size={18}
                className={`text-[#2F9E44] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div className={`overflow-hidden transition-all ${isOpen ? "max-h-96" : "max-h-0"}`}>
              <p className="px-4 pb-4 text-[#475569] text-sm leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
