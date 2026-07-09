"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { formatPrice, cn } from "@/lib/utils";

const RECENT_KEY = "ryta-recent-searches";
const POPULAR = ["Parfum", "Crème visage", "Maquillage", "Pommade", "Shampoing", "Coffret"];
const SUGGEST_LIMIT = 6;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}
function pushRecent(term: string) {
  if (typeof window === "undefined" || !term.trim()) return;
  const next = [term.trim(), ...readRecent().filter((t) => t.toLowerCase() !== term.trim().toLowerCase())].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

interface Props {
  /** Rendu compact pour le header (fond sombre) vs plein (page mobile). */
  variant?: "header" | "block";
  autoFocus?: boolean;
  onClose?: () => void;
  className?: string;
  /** N'affiche le panneau flottant que lorsqu'il y a une requête (récents/populaires masqués).
   *  Utile dans le tiroir de recherche qui gère ses propres suggestions. */
  hideEmptyState?: boolean;
}

export default function SearchAutocomplete({ variant = "header", autoFocus, onClose, className, hideEmptyState }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, loading } = useProductSearch(query, { limit: SUGGEST_LIMIT });
  const suggestions = results.slice(0, SUGGEST_LIMIT);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRecent(readRecent()), [open]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHighlight(-1), [query]);

  // Fermer au clic extérieur
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    pushRecent(t);
    setOpen(false);
    onClose?.();
    router.push(`/recherche?q=${encodeURIComponent(t)}`);
  };

  const goToProduct = (slug: string, term: string) => {
    pushRecent(term);
    setOpen(false);
    onClose?.();
    router.push(`/produit/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && suggestions[highlight]) {
        goToProduct(suggestions[highlight].slug, query);
      } else {
        go(query);
      }
    }
  };

  const hasQuery = query.trim().length >= 2;
  const showPanel = open && (hasQuery || !hideEmptyState);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Input */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl transition-colors",
          variant === "header"
            ? "bg-white/10 border border-white/20 px-3 h-9 focus-within:bg-white/15 focus-within:border-[#C9A063]/50"
            : "bg-white border border-gray-200 px-3.5 h-11 focus-within:border-green shadow-sm"
        )}
      >
        <Search size={16} className={variant === "header" ? "text-gray-300 shrink-0" : "text-gray-400 shrink-0"} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher un produit, marque…"
          aria-label="Rechercher"
          className={cn(
            "w-full bg-transparent text-sm outline-none",
            variant === "header" ? "text-white placeholder-gray-400" : "text-[#020B27] placeholder-gray-400"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            aria-label="Effacer"
            className={variant === "header" ? "text-gray-300 hover:text-white shrink-0" : "text-gray-400 hover:text-gray-600 shrink-0"}
          >
            <X size={15} />
          </button>
        )}
        {onClose && variant === "header" && (
          <button type="button" onClick={onClose} aria-label="Fermer la recherche" className="text-gray-300 hover:text-white shrink-0">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Panneau */}
      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-2 w-full min-w-[20rem] rounded-xl border border-gray-100 bg-white shadow-2xl overflow-hidden z-[60] text-left">
          {/* État : requête active */}
          {hasQuery ? (
            <>
              {loading && suggestions.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-6 text-sm text-[#64748B]">
                  <Loader2 size={16} className="animate-spin text-green" />
                  Recherche en cours…
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-[#020B27]">Aucun résultat pour « {query} »</p>
                  <button onClick={() => go(query)} className="mt-2 text-xs font-medium text-green hover:underline">
                    Voir toute la boutique
                  </button>
                </div>
              ) : (
                <ul className="max-h-[60vh] overflow-y-auto py-1.5">
                  {suggestions.map((p, i) => (
                    <li key={p.id}>
                      <button
                        onMouseEnter={() => setHighlight(i)}
                        onClick={() => goToProduct(p.slug, query)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                          i === highlight ? "bg-green/5" : "hover:bg-gray-50"
                        )}
                      >
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#F8FAFC]">
                          {p.main_image_url ? (
                            <Image src={p.main_image_url} alt={p.name} fill className="object-contain p-1" sizes="44px" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg">📦</span>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[#020B27]">{p.name}</span>
                          {p.category && (
                            <span className="block truncate text-[11px] text-[#64748B]">{p.category.name}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-green">{formatPrice(p.current_price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Voir tous les résultats */}
              <button
                onClick={() => go(query)}
                className="flex w-full items-center justify-between border-t border-gray-100 bg-[#F8FAFC] px-4 py-2.5 text-sm font-semibold text-[#020B27] hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search size={14} className="text-green" />
                  Voir tous les résultats pour « {query} »
                </span>
                <ArrowRight size={15} />
              </button>
            </>
          ) : (
            /* État : vide → récents + populaires */
            <div className="p-3">
              {recent.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                    <Clock size={12} /> Recherches récentes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recent.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setQuery(t); go(t); }}
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs text-[#020B27] hover:border-green hover:text-green transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
                  <TrendingUp size={12} /> Recherches populaires
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setQuery(t); go(t); }}
                      className="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs text-[#020B27] hover:bg-green/10 hover:text-green transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
