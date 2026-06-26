"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Grid3X3, List, X } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product, Category, Brand } from "@/types";
import { formatPrice } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "promo", label: "Meilleures offres" },
  { value: "popular", label: "Popularité" },
];

interface Props {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export default function BoutiqueContent({ products, categories, brands }: Props) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categorie") || "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category?.slug || ""));
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
  }, [products, selectedCategories, selectedBrands, priceRange, onlyPromo, sort]);

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

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-[#0F172A] mb-3 text-sm">Catégories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A]"
              />
              <span className="text-sm text-gray-600 group-hover:text-[#0F172A] transition-colors">
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#0F172A] mb-3 text-sm">Marques</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.slug} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => toggleBrand(brand.slug)}
                  className="rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A]"
                />
                <span className="text-sm text-gray-600 group-hover:text-[#0F172A] transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-[#0F172A] mb-3 text-sm">Prix maximum</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={1000000}
            step={5000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full accent-[#16A34A]"
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
            className="rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A]"
          />
          <span className="text-sm font-medium text-gray-700">Promotions uniquement</span>
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
          backgroundImage: "url('/banners/boutique.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-night/35" />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Boutique</h1>
          <p className="text-gray-300">Découvrez toute notre sélection de produits au meilleur prix</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="font-bold text-[#0F172A] mb-5 text-base">Filtres</h2>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-5 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[#0F172A] border border-gray-200 px-4 py-2.5 rounded-xl active:scale-95 transition-all hover:border-green"
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                </button>
                <span className="text-sm text-[#64748B] lg:block">
                  <span className="font-bold text-[#0F172A]">{filtered.length}</span>{" "}
                  produit{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-green text-[#0F172A] bg-white"
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
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Aucun produit trouvé</h3>
                <p className="text-[#64748B] mb-6">Essayez de modifier vos filtres</p>
                <button
                  onClick={resetFilters}
                  className="bg-green text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#15803d] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${view === "grid" ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-[#0F172A]">Filtres</h2>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-green text-white py-3 rounded-xl font-medium hover:bg-[#15803d] transition-colors"
              >
                Afficher {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
