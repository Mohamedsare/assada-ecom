"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ShieldCheck, Tag, Truck, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import CategoryIcon from "@/components/ui/CategoryIcon";
import type { Product, Category } from "@/types";
import { usePageImage } from "@/stores/config";
import { CATEGORIES } from "@/lib/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "popular", label: "Popularité" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Produits 100% authentiques" },
  { icon: Tag,         label: "Meilleurs prix garantis" },
  { icon: Truck,       label: "Livraison rapide à Casablanca" },
];

interface Props {
  products: Product[];
  categories: Category[];
}

export default function NouveautesContent({ products, categories }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const bannerImg = usePageImage("banner_nouveautes");

  // Bande de catégories : catégories de tête de la base (image_url gérée en admin, emoji de repli).
  const emojiBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.emoji]));
  const visualCats = categories
    .filter((c) => !c.parent_id)
    .map((c) => ({ name: c.name, slug: c.slug, image: c.image_url, emoji: emojiBySlug[c.slug] ?? "🛍️" }));
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category?.slug || ""));
    }
    switch (sort) {
      case "price_asc": list.sort((a, b) => a.current_price - b.current_price); break;
      case "price_desc": list.sort((a, b) => b.current_price - a.current_price); break;
      case "popular": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }
    return list;
  }, [products, selectedCategories, sort]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const slug = p.category?.slug || "";
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    });
    return counts;
  }, [products]);

  const toggleCategory = (slug: string) =>
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  const resetFilters = () => setSelectedCategories([]);

  const renderFilterPanel = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-[#020B27] mb-3 text-sm">Catégories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                  className="rounded border-gray-300 text-green focus:ring-green"
                />
                <span className="text-sm text-gray-600 group-hover:text-[#020B27] transition-colors">
                  {cat.name}
                </span>
              </div>
              <span className="text-xs text-gray-400">({categoryCounts[cat.slug] || 0})</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div
        className="relative text-white overflow-hidden"
        style={{
          backgroundImage: `url('${bannerImg}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-night/50" />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <span className="inline-block border border-green-light text-green-light text-xs font-bold uppercase tracking-widest px-3 py-1 mb-4">
            Nouveauté
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Nouveautés</h1>
          <p className="text-gray-200 text-base md:text-lg max-w-lg mb-8">
            Découvrez en avant-première nos nouveaux produits sélectionnés rien que pour vous.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-8">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/90">
                <div className="w-7 h-7 rounded-full border border-green-light flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-green-light" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
            {visualCats.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => toggleCategory(cat.slug)}
                className={`flex flex-col items-center gap-2 shrink-0 group transition-all ${
                  selectedCategories.includes(cat.slug) ? "opacity-100" : "opacity-80 hover:opacity-100"
                }`}
              >
                <div className={`w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-50 transition-colors ${
                  selectedCategories.includes(cat.slug)
                    ? "border-green"
                    : "border-gray-200 group-hover:border-green"
                }`}>
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <CategoryIcon slug={cat.slug} size={30} strokeWidth={1.5} className="text-[#B8925A]" />
                  )}
                </div>
                <span className="text-xs font-medium text-[#020B27] text-center w-20 leading-tight">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-44 shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[#020B27] text-base">Filtres</h2>
                {selectedCategories.length > 0 && (
                  <button onClick={resetFilters} className="text-xs text-green font-semibold hover:underline">
                    Réinitialiser
                  </button>
                )}
              </div>
              {renderFilterPanel()}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-6 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[#020B27] border border-gray-200 px-4 py-2.5 rounded-xl active:scale-95 transition-all hover:border-green"
                >
                  <SlidersHorizontal size={16} />
                  Filtres
                </button>
                <span className="text-sm text-text-secondary">
                  <span className="font-bold text-[#020B27]">{filtered.length}</span>{" "}
                  nouveau{filtered.length !== 1 ? "x" : ""} produit{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary shrink-0">Trier par :</span>
                <div className="relative flex-1">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full appearance-none font-semibold text-[#020B27] pr-8 pl-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-green bg-white text-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-lg font-semibold text-[#020B27] mb-2">Aucun produit trouvé</h3>
                <p className="text-text-secondary mb-6">Essayez de modifier vos filtres</p>
                <button
                  onClick={resetFilters}
                  className="bg-green text-[#020B27] px-6 py-2.5 rounded-xl font-medium hover:bg-[#9E7A45] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#020B27]">Filtres</h2>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {renderFilterPanel()}
            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full mt-6 bg-green text-[#020B27] py-3 rounded-xl font-semibold"
            >
              Voir les résultats ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
