"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Search, X, Loader2, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { useProductSearch } from "@/hooks/useProductSearch";
import { calculateDiscount, formatPrice, cn } from "@/lib/utils";

type Sort = "pertinence" | "price-asc" | "price-desc" | "offers";
const SORTS: { key: Sort; label: string }[] = [
  { key: "pertinence", label: "Pertinence" },
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "offers", label: "Meilleures offres" },
];

export default function RechercheContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [input, setInput] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("pertinence");

  // Filtres (aside gauche)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { results, loading } = useProductSearch(input, { limit: 48, debounce: 250 });
  const hasQuery = input.trim().length >= 2;

  // Reflète la requête dans l'URL (partageable) sans recharger la page
  useEffect(() => {
    const t = setTimeout(() => {
      const q = input.trim();
      window.history.replaceState(null, "", q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche");
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  // Réinitialise les filtres quand on change de terme de recherche
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategories([]); setSelectedBrands([]); setOnlyPromo(false); setPriceMax(null);
  }, [input]);

  // Verrouille le scroll + Échap quand le tiroir filtres (mobile) est ouvert
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [filtersOpen]);

  // Options de filtres dérivées des résultats bruts de la recherche
  const categoryOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of results) if (p.category?.slug) m.set(p.category.slug, p.category.name);
    return [...m].map(([slug, name]) => ({ slug, name }));
  }, [results]);

  const brandOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of results) if (p.brand?.slug) m.set(p.brand.slug, p.brand.name);
    return [...m].map(([slug, name]) => ({ slug, name }));
  }, [results]);

  const maxBound = useMemo(() => {
    const m = results.reduce((mx, p) => Math.max(mx, p.current_price), 0);
    return m > 0 ? Math.ceil(m / 1000) * 1000 : 100000;
  }, [results]);
  const effectiveMax = priceMax ?? maxBound;

  const filtered = useMemo(() => {
    let list = [...results];
    if (selectedCategories.length) list = list.filter((p) => selectedCategories.includes(p.category?.slug || ""));
    if (selectedBrands.length) list = list.filter((p) => selectedBrands.includes(p.brand?.slug || ""));
    if (onlyPromo) list = list.filter((p) => p.is_promo);
    list = list.filter((p) => p.current_price <= effectiveMax);
    if (sort === "price-asc") list.sort((a, b) => a.current_price - b.current_price);
    else if (sort === "price-desc") list.sort((a, b) => b.current_price - a.current_price);
    else if (sort === "offers")
      list.sort((a, b) =>
        (b.old_price ? calculateDiscount(b.old_price, b.current_price) : 0) -
        (a.old_price ? calculateDiscount(a.old_price, a.current_price) : 0)
      );
    return list;
  }, [results, selectedCategories, selectedBrands, onlyPromo, effectiveMax, sort]);

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || onlyPromo || priceMax !== null;
  const resetFilters = () => { setSelectedCategories([]); setSelectedBrands([]); setOnlyPromo(false); setPriceMax(null); };
  const toggleCategory = (slug: string) =>
    setSelectedCategories((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  const toggleBrand = (slug: string) =>
    setSelectedBrands((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const showResults = hasQuery && !loading && filtered.length > 0;
  const showEmpty = !loading && filtered.length === 0;
  const hasRaw = results.length > 0;

  let subtitle = "Veuillez saisir un terme de recherche";
  if (loading && hasQuery) subtitle = "Recherche en cours…";
  else if (showResults) subtitle = `${filtered.length} résultat${filtered.length !== 1 ? "s" : ""} pour « ${input.trim()} »`;

  const filterPanel = (
    <div className="space-y-6">
      {categoryOptions.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#020B27] mb-3 text-sm">Catégories</h3>
          <div className="space-y-2">
            {categoryOptions.map((cat) => (
              <label key={cat.slug} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedCategories.includes(cat.slug)} onChange={() => toggleCategory(cat.slug)}
                  className="rounded border-gray-300 text-[#020B27] focus:ring-[#B8925A]" />
                <span className="text-sm text-gray-600 group-hover:text-[#020B27] transition-colors">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {brandOptions.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#020B27] mb-3 text-sm">Marques</h3>
          <div className="space-y-2">
            {brandOptions.map((brand) => (
              <label key={brand.slug} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedBrands.includes(brand.slug)} onChange={() => toggleBrand(brand.slug)}
                  className="rounded border-gray-300 text-[#020B27] focus:ring-[#B8925A]" />
                <span className="text-sm text-gray-600 group-hover:text-[#020B27] transition-colors">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-[#020B27] mb-3 text-sm">Prix maximum</h3>
        <div className="space-y-3">
          <input type="range" min={0} max={maxBound} step={1000} value={effectiveMax}
            onChange={(e) => setPriceMax(parseInt(e.target.value))} className="w-full accent-[#020B27]" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(effectiveMax)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={onlyPromo} onChange={(e) => setOnlyPromo(e.target.checked)}
            className="rounded border-gray-300 text-[#020B27] focus:ring-[#B8925A]" />
          <span className="text-sm font-medium text-gray-700">Promo uniquement</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button onClick={resetFilters} className="w-full text-sm text-[#EF4444] hover:text-red-700 font-medium flex items-center justify-center gap-1">
          <X size={14} /> Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-16">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-sm text-[#64748B]">
          <Link href="/" className="hover:text-[#020B27] transition-colors">Accueil</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-[#020B27] font-medium">Recherche</span>
        </nav>

        {/* Titre + sous-titre + barre */}
        <div className="mt-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#020B27]">Recherche</h1>
          <p className="mt-3 text-[#64748B]">{subtitle}</p>

          <div className="mt-8 w-full max-w-2xl">
            <div className="flex items-center gap-3 rounded-full bg-[#F5F1EA] border border-transparent focus-within:border-[#B8925A]/40 px-6 h-16 transition-colors">
              <Search size={22} className="text-[#020B27] shrink-0" />
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} autoFocus
                placeholder="Rechercher rouge à lèvres, sérum, parfum …" aria-label="Rechercher"
                className="min-w-0 flex-1 bg-transparent text-base md:text-lg text-[#020B27] placeholder-[#64748B] outline-none" />
              {loading ? (
                <Loader2 size={18} className="animate-spin text-green shrink-0" />
              ) : input ? (
                <button type="button" onClick={() => setInput("")} aria-label="Effacer"
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-[#020B27] flex items-center justify-center shrink-0 transition-colors">
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Résultats */}
        {loading && hasQuery && filtered.length === 0 ? (
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : showResults || (hasRaw && !loading) ? (
          <div className="mt-12 flex gap-8">
            {/* Aside filtres — desktop */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="font-bold text-[#020B27] mb-5 text-base">Filtres</h2>
                {filterPanel}
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {/* Barre outils */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <button onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[#020B27] border border-gray-200 px-4 py-2.5 rounded-xl hover:border-green transition-colors">
                  <SlidersHorizontal size={16} /> Filtres
                </button>
                <label className="ml-auto flex items-center gap-2 text-sm">
                  <SlidersHorizontal size={15} className="text-[#64748B]" />
                  <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#020B27] outline-none focus:border-green">
                    {SORTS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
                  </select>
                </label>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map((product) => (<ProductCard key={product.id} product={product} />))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#020B27] leading-snug">
                    Aucun produit trouvé
                    <br />
                    Utilisez moins de filtres ou{" "}
                    <button type="button" onClick={resetFilters} className="underline underline-offset-4 hover:text-[#B8925A] transition-colors">
                      effacez tout
                    </button>
                  </h2>
                </div>
              )}
            </div>
          </div>
        ) : showEmpty ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#020B27] leading-snug">
              Aucun produit trouvé
              <br />
              Utilisez moins de filtres ou{" "}
              <button type="button" onClick={() => { setInput(""); resetFilters(); }}
                className="underline underline-offset-4 hover:text-[#B8925A] transition-colors">
                effacez tout
              </button>
            </h2>
            <Link href="/boutique"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-green px-8 py-4 text-base font-bold text-white btn-sweep hover:bg-[#9E7A45] transition-colors">
              Continuer vos achats
            </Link>
          </div>
        ) : null}
      </div>

      {/* Tiroir filtres — mobile */}
      <div className={cn("lg:hidden fixed inset-0 z-[80]", filtersOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!filtersOpen}>
        <div onClick={() => setFiltersOpen(false)}
          className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", filtersOpen ? "opacity-100" : "opacity-0")} />
        <aside role="dialog" aria-modal="true" aria-label="Filtres"
          className={cn("absolute left-0 top-0 h-full w-[82%] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-300", filtersOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-[#020B27]">Filtres</h2>
            <button onClick={() => setFiltersOpen(false)} aria-label="Fermer" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
          <div className="shrink-0 p-4 border-t border-gray-100">
            <button onClick={() => setFiltersOpen(false)}
              className="w-full bg-green text-white font-semibold py-3 rounded-xl btn-sweep hover:bg-[#9E7A45] transition-colors">
              Voir {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
