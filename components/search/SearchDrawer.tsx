"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { AXES } from "@/lib/constants";
import { useProductSearch } from "@/hooks/useProductSearch";
import CategoryIcon from "@/components/ui/CategoryIcon";

/** Recherches populaires mises en avant (façon apia). */
const QUICK_SEARCHES = ["Parfum", "Argan", "Miel", "Amlou", "Crème visage", "Vitamines"];

/** Toutes les « collections » recherchables : axes + catégories + sous-catégories (statique). */
const COLLECTIONS: { name: string; slug: string }[] = AXES.flatMap((axis) => [
  { name: axis.name, slug: axis.slug },
  ...axis.children.flatMap((cat) => [
    { name: cat.name, slug: cat.slug },
    ...(cat.children ?? []).map((leaf) => ({ name: leaf.name, slug: leaf.slug })),
  ]),
]);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Tiroir de recherche latéral droit (façon apia) : ouvert depuis l'icône loupe du header.
 * Recherche asynchrone en direct — les produits s'affichent au fur et à mesure de la frappe,
 * avec onglets Produits / Collections. Se ferme via la croix, le fond ou Échap.
 */
export default function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"produits" | "collections">("produits");

  const { results: products, loading } = useProductSearch(query, { limit: 8 });
  const hasQuery = query.trim().length >= 2;

  const collections = useMemo(() => {
    if (!hasQuery) return [];
    const n = norm(query.trim());
    return COLLECTIONS.filter((c) => norm(c.name).includes(n)).slice(0, 8);
  }, [query, hasQuery]);

  // Verrouille le scroll du body + focus / reset à l'ouverture-fermeture
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => { clearTimeout(t); document.body.style.overflow = ""; };
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setTab("produits");
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Fermeture au clavier (Échap)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    const t = query.trim();
    if (t) { onClose(); router.push(`/recherche?q=${encodeURIComponent(t)}`); }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Tiroir */}
      <aside
        role="dialog"
        aria-label="Recherche"
        aria-modal="true"
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-[100] flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-2xl font-bold text-[#0A2A52]">Recherche</h2>
          <button
            onClick={onClose}
            aria-label="Fermer la recherche"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0A2A52] flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="px-6 shrink-0">
          <div className="flex items-center gap-3 rounded-full bg-[#F5F1EA] border border-transparent focus-within:border-[#2F9E44]/40 px-5 h-14 transition-colors">
            <Search size={20} className="text-[#0A2A52] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="crème, soins, cheveux…"
              aria-label="Rechercher"
              className="w-full bg-transparent text-base text-[#0A2A52] placeholder-[#64748B] outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                aria-label="Effacer"
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-[#0A2A52] flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!hasQuery ? (
            /* État vide — recherches populaires */
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
                <TrendingUp size={13} /> Recherches populaires
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {QUICK_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-lg font-bold uppercase tracking-wide text-[#0A2A52] hover:text-green transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Onglets */}
              <div className="flex items-center gap-6 border-b border-gray-100 mb-4">
                {([
                  { id: "produits", label: "Produits", count: products.length },
                  { id: "collections", label: "Collections", count: collections.length },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "relative pb-3 text-sm font-semibold transition-colors",
                      tab === t.id ? "text-[#0A2A52]" : "text-text-secondary hover:text-[#0A2A52]"
                    )}
                  >
                    {t.label}
                    {t.count > 0 && <span className="ml-1.5 text-xs text-text-secondary">({t.count})</span>}
                    {tab === t.id && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#2F9E44] rounded-full" />}
                  </button>
                ))}
              </div>

              {/* Onglet Produits */}
              {tab === "produits" && (
                loading && products.length === 0 ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-[#64748B]">
                    <Loader2 size={16} className="animate-spin text-green" /> Recherche en cours…
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm font-medium text-[#0A2A52]">Aucun produit pour « {query} »</p>
                    <Link href="/boutique" onClick={onClose} className="mt-2 inline-block text-xs font-semibold text-green hover:underline">
                      Voir toute la boutique
                    </Link>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-1">
                      {products.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/produit/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-4 rounded-xl p-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#F8FAFC]">
                              {p.main_image_url ? (
                                <Image src={p.main_image_url} alt={p.name} fill className="object-contain p-1" sizes="64px" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xl">📦</span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-semibold text-[#0A2A52] leading-snug line-clamp-2">{p.name}</span>
                              <span className="mt-1 block text-sm font-bold text-green">{formatPrice(p.current_price)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={submit}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A2A52] py-3 text-sm font-semibold text-white hover:bg-[#0E2440] transition-colors"
                    >
                      Voir tous les résultats pour « {query} » <ArrowRight size={15} />
                    </button>
                  </>
                )
              )}

              {/* Onglet Collections */}
              {tab === "collections" && (
                collections.length === 0 ? (
                  <div className="py-8 text-center text-sm font-medium text-[#0A2A52]">
                    Aucune collection pour « {query} »
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {collections.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/boutique?categorie=${c.slug}`}
                        onClick={onClose}
                        className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-center hover:border-[#2F9E44]/40 hover:shadow-md transition-all"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F1EA]">
                          <CategoryIcon slug={c.slug} size={24} className="text-[#2F9E44]" />
                        </span>
                        <span className="text-sm font-semibold text-[#0A2A52] group-hover:text-green transition-colors">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
