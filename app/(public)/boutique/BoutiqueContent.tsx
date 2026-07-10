"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Grid3X3, List, X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product, Category, Brand } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { usePageImage } from "@/stores/config";

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "promo", label: "Meilleures offres" },
  { value: "popular", label: "Popularité" },
];

const PAGE_SIZE = 20;

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  bannerTitle?: string;
  bannerSubtitle?: string;
}

export default function BoutiqueContent({
  products,
  categories,
  brands,
  bannerTitle = "Boutique",
  bannerSubtitle = "Découvrez toute notre sélection de produits au meilleur prix",
}: Props) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categorie") || "";
  const bannerImg = usePageImage("banner_boutique");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Resynchronise le filtre catégorie quand l'URL change (navigation méga-menu).
  useEffect(() => {
    const c = searchParams.get("categorie") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategories(c ? [c] : []);
  }, [searchParams]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Verrouille le scroll du body + fermeture au clavier (Échap) quand le drawer mobile est ouvert.
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [filtersOpen]);

  // Catégories de tête pour la sidebar (le méga-menu gère les sous-catégories).
  const topCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);

  // slug d'une catégorie -> ensemble { elle-même + tous ses descendants },
  // pour qu'un filtre parent (ex. « parfums ») inclue « parfums-homme », etc.
  const descendantsBySlug = useMemo(() => {
    const childrenByParent = new Map<string, Category[]>();
    for (const c of categories) {
      if (c.parent_id) {
        const arr = childrenByParent.get(c.parent_id) ?? [];
        arr.push(c);
        childrenByParent.set(c.parent_id, arr);
      }
    }
    const cache = new Map<string, Set<string>>();
    const collect = (cat: Category): Set<string> => {
      const cached = cache.get(cat.slug);
      if (cached) return cached;
      const set = new Set<string>([cat.slug]);
      cache.set(cat.slug, set); // pose avant récursion (garde-fou anti-cycle)
      for (const child of childrenByParent.get(cat.id) ?? []) {
        for (const s of collect(child)) set.add(s);
      }
      return set;
    };
    const result = new Map<string, Set<string>>();
    for (const c of categories) result.set(c.slug, collect(c));
    return result;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategories.length > 0) {
      const wanted = new Set<string>();
      for (const slug of selectedCategories) {
        const set = descendantsBySlug.get(slug);
        if (set) set.forEach((s) => wanted.add(s));
        else wanted.add(slug);
      }
      list = list.filter((p) => wanted.has(p.category?.slug || ""));
    }
    if (selectedBrands.length > 0) {
      list = list.filter((p) => selectedBrands.includes(p.brand?.slug || ""));
    }
    if (onlyPromo) list = list.filter((p) => p.is_promo);
    list = list.filter(
      (p) => p.current_price >= priceRange[0] && p.current_price <= priceRange[1]
    );
    switch (sort) {
      case "price_asc": list.sort((a, b) => a.current_price - b.current_price); break;
      case "price_desc": list.sort((a, b) => b.current_price - a.current_price); break;
      case "promo": list.sort((a, b) => (b.is_promo ? 1 : 0) - (a.is_promo ? 1 : 0)); break;
      case "popular": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }
    return list;
  }, [products, selectedCategories, selectedBrands, priceRange, onlyPromo, sort, descendantsBySlug]);

  // Pagination — 20 produits par page.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Revient à la page 1 quand un filtre / tri change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [selectedCategories, selectedBrands, onlyPromo, priceRange, sort]);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Numéros affichés : 1, page-1..page+1, dernier (avec ellipses).
  const pageNumbers = useMemo(() => {
    const nums: (number | "…")[] = [];
    let last = 0;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        if (last && i - last > 1) nums.push("…");
        nums.push(i);
        last = i;
      }
    }
    return nums;
  }, [totalPages, currentPage]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setOnlyPromo(false);
    setPriceRange([0, 1000000]);
  };

  const toggleCategory = (slug: string) =>
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  const toggleBrand = (slug: string) =>
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  const renderFilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-[#020B27] mb-3 text-sm">Catégories</h3>
        <div className="space-y-2">
          {topCategories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="rounded border-gray-300 text-[#020B27] focus:ring-[#B8925A]"
              />
              <span className="text-sm text-gray-600 group-hover:text-[#020B27] transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#020B27] mb-3 text-sm">Marques</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.slug} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="rounded border-gray-300 text-[#020B27] focus:ring-[#B8925A]"
                />
                <span className="text-sm text-gray-600 group-hover:text-[#020B27] transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-[#020B27] mb-3 text-sm">Prix maximum</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={1000000}
            step={5000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-[#020B27]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyPromo}
            onChange={(e) => setOnlyPromo(e.target.checked)}
            className="rounded border-gray-300 text-[#020B27] focus:ring-[#B8925A]"
          />
          <span className="text-sm font-medium text-gray-700">Promo uniquement</span>
        </label>
      </div>

      {(selectedCategories.length > 0 || selectedBrands.length > 0 || onlyPromo) && (
        <button
          onClick={resetFilters}
          className="w-full text-sm text-[#EF4444] hover:text-red-700 font-medium flex items-center justify-center gap-1"
        >
          <X size={14} />
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div
        className="relative text-white py-16 px-4 overflow-hidden"
        style={{
          backgroundImage: `url('${bannerImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-night/35" />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{bannerTitle}</h1>
          <p className="text-gray-300">{bannerSubtitle}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-44 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold text-[#020B27] mb-5 text-base">Filtres</h2>
              {renderFilterPanel()}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-5 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[#020B27] border border-gray-200 px-4 py-2.5 rounded-xl active:scale-95 transition-all hover:border-green"
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                </button>
                <span className="text-sm text-[#64748B] lg:block">
                  <span className="font-bold text-[#020B27]">{filtered.length}</span>{" "}
                  produit{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-green text-[#020B27] bg-white"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <div className="flex border border-gray-200 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2.5 transition-colors ${view === "grid" ? "bg-green text-white" : "text-gray-400 hover:bg-gray-50 active:bg-gray-100"}`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`p-2.5 transition-colors ${view === "list" ? "bg-green text-white" : "text-gray-400 hover:bg-gray-50 active:bg-gray-100"}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-[#020B27] mb-2">Aucun produit trouvé</h3>
                <p className="text-[#64748B] mb-6">Essayez de modifier vos filtres</p>
                <button
                  onClick={resetFilters}
                  className="bg-green text-white px-6 py-2.5 rounded-xl font-medium btn-sweep hover:bg-[#9E7A45] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div ref={resultsRef} className={`grid gap-4 scroll-mt-24 ${view === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                  {paged.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Page précédente"
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-[#020B27] disabled:opacity-40 disabled:cursor-not-allowed hover:border-green active:scale-95 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {pageNumbers.map((n, i) =>
                      n === "…" ? (
                        <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-[#64748B]">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => goToPage(n)}
                          aria-current={n === currentPage ? "page" : undefined}
                          className={cn(
                            "w-9 h-9 rounded-lg text-sm font-semibold transition-all active:scale-95",
                            n === currentPage
                              ? "bg-green text-white"
                              : "border border-gray-200 text-[#020B27] hover:border-green"
                          )}
                        >
                          {n}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Page suivante"
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-[#020B27] disabled:opacity-40 disabled:cursor-not-allowed hover:border-green active:scale-95 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawer de filtres (mobile) — aside glissant depuis la gauche */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          filtersOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!filtersOpen}
      >
        {/* Voile */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out",
            filtersOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setFiltersOpen(false)}
        />
        {/* Panneau */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtres"
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[70%] max-w-[230px] bg-white shadow-2xl rounded-r-2xl flex flex-col",
            "transition-transform duration-300 ease-out will-change-transform",
            filtersOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-[#020B27] flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-green" /> Filtres
            </h2>
            <button
              onClick={() => setFiltersOpen(false)}
              aria-label="Fermer les filtres"
              className="p-1.5 -mr-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#020B27] active:scale-95 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {renderFilterPanel()}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-green text-white py-3 rounded-xl font-semibold btn-sweep hover:bg-[#9E7A45] active:scale-[0.98] transition-all"
            >
              Afficher {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
