"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "best", label: "Meilleures ventes" },
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

export default function CoffretsContent({ packs }: { packs: Product[] }) {
  const maxPrice = useMemo(
    () => Math.max(100, ...packs.map((p) => p.current_price)),
    [packs],
  );

  const inStockCount = useMemo(() => packs.filter((p) => p.stock_quantity > 0).length, [packs]);
  const outStockCount = packs.length - inStockCount;

  const [inStock, setInStock] = useState(false);
  const [outStock, setOutStock] = useState(false);
  const [price, setPrice] = useState<[number, number]>([0, maxPrice]);
  const [sort, setSort] = useState("best");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Réajuste la borne haute du prix si la liste change (ex. router.refresh).
  const [prevMax, setPrevMax] = useState(maxPrice);
  if (maxPrice !== prevMax) {
    setPrevMax(maxPrice);
    setPrice(([min]) => [min, maxPrice]);
  }

  // Verrouille le scroll quand le tiroir mobile est ouvert.
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); };
  }, [filtersOpen]);

  const filtered = useMemo(() => {
    let list = packs.filter((p) => p.current_price >= price[0] && p.current_price <= price[1]);
    // Disponibilité : si une seule case est cochée on filtre ; sinon on montre tout.
    if (inStock && !outStock) list = list.filter((p) => p.stock_quantity > 0);
    else if (outStock && !inStock) list = list.filter((p) => p.stock_quantity === 0);

    switch (sort) {
      case "price_asc": list = [...list].sort((a, b) => a.current_price - b.current_price); break;
      case "price_desc": list = [...list].sort((a, b) => b.current_price - a.current_price); break;
      case "newest": break; // déjà trié par date (requête)
      case "best": list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    }
    return list;
  }, [packs, price, inStock, outStock, sort]);

  const resetFilters = () => {
    setInStock(false);
    setOutStock(false);
    setPrice([0, maxPrice]);
  };

  const filterPanel = (
    <div className="space-y-6">
      {/* Disponibilité */}
      <div>
        <h3 className="font-semibold text-[#0A2A52] mb-3 text-sm">Disponibilité</h3>
        <div className="space-y-2.5">
          <label className="flex items-center justify-between gap-2 cursor-pointer group">
            <span className="flex items-center gap-2">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="rounded border-gray-300 text-green focus:ring-green accent-green" />
              <span className="text-sm text-gray-600 group-hover:text-[#0A2A52] transition-colors">En stock</span>
            </span>
            <span className="text-xs text-gray-400">{inStockCount}</span>
          </label>
          <label className="flex items-center justify-between gap-2 cursor-pointer group">
            <span className="flex items-center gap-2">
              <input type="checkbox" checked={outStock} onChange={(e) => setOutStock(e.target.checked)} className="rounded border-gray-300 text-green focus:ring-green accent-green" />
              <span className="text-sm text-gray-600 group-hover:text-[#0A2A52] transition-colors">En rupture de stock</span>
            </span>
            <span className="text-xs text-gray-400">{outStockCount}</span>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Prix */}
      <div>
        <h3 className="font-semibold text-[#0A2A52] mb-2 text-sm">Prix</h3>
        <p className="text-xs text-gray-500 mb-3">Le prix le plus élevé est {formatPrice(maxPrice)}</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
            <span className="text-xs text-gray-400">DH</span>
            <input
              type="number" min={0} max={price[1]} value={price[0]}
              onChange={(e) => setPrice([Math.min(Number(e.target.value) || 0, price[1]), price[1]])}
              className="w-full text-sm outline-none min-w-0"
            />
          </div>
          <span className="text-gray-400">–</span>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
            <span className="text-xs text-gray-400">DH</span>
            <input
              type="number" min={price[0]} max={maxPrice} value={price[1]}
              onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value) || 0, price[0])])}
              className="w-full text-sm outline-none min-w-0"
            />
          </div>
        </div>
        <input
          type="range" min={0} max={maxPrice} step={5} value={price[1]}
          onChange={(e) => setPrice([price[0], Number(e.target.value)])}
          className="w-full accent-[#0A2A52]"
        />
      </div>

      {(inStock || outStock || price[0] > 0 || price[1] < maxPrice) && (
        <button onClick={resetFilters} className="w-full text-sm text-[#EF4444] hover:text-red-700 font-medium flex items-center justify-center gap-1">
          <X size={14} /> Réinitialiser les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6" aria-label="Fil d'Ariane">
          <Link href="/" className="hover:text-[#0A2A52] transition-colors">Accueil</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-[#0A2A52] font-medium uppercase tracking-wide">Coffrets cadeaux</span>
        </nav>

        {/* Titre */}
        <h1 className="text-center text-3xl md:text-4xl font-bold text-[#0A2A52] tracking-tight mb-8">
          Coffrets cadeaux
        </h1>

        <div className="flex gap-8">
          {/* Sidebar filtres — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">{filterPanel}</div>
          </aside>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            {/* Barre : nb résultats + tri */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-semibold text-[#0A2A52] border border-gray-200 px-4 py-2 rounded-xl active:scale-95 transition-all hover:border-green"
              >
                <SlidersHorizontal size={16} /> Filtres
              </button>
              <span className="text-sm text-gray-500 hidden lg:block">
                {filtered.length} {filtered.length === 1 ? "produit" : "produits"}
              </span>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline text-gray-500">Trier par :</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-green bg-white text-[#0A2A52]"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-lg font-semibold text-[#0A2A52] mb-2">Aucun coffret trouvé</h3>
                <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
                <button onClick={resetFilters} className="bg-green text-white px-6 py-2.5 rounded-xl font-medium btn-sweep hover:bg-[#237A34] transition-colors">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filtered.map((pack) => (
                    <ProductCard key={pack.id} product={pack} className="border border-gray-100 rounded-xl overflow-hidden" />
                  ))}
                </div>

                <div className="mt-12 flex flex-col items-center">
                  <p className="text-sm text-gray-500">Vous avez vu {filtered.length} sur {packs.length} résultats</p>
                  <span className="mt-2 h-0.5 w-40 bg-[#0A2A52] rounded-full" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawer filtres — mobile */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", filtersOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!filtersOpen}>
        <div
          className={cn("absolute inset-0 bg-black/50 transition-opacity duration-300", filtersOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setFiltersOpen(false)}
        />
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] bg-white shadow-2xl rounded-r-2xl flex flex-col transition-transform duration-300 ease-out",
          filtersOpen ? "translate-x-0" : "-translate-x-full",
        )}>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-[#0A2A52] flex items-center gap-2"><SlidersHorizontal size={17} className="text-green" /> Filtres</h2>
            <button onClick={() => setFiltersOpen(false)} aria-label="Fermer" className="p-1.5 -mr-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#0A2A52] transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{filterPanel}</div>
          <div className="px-4 py-3 border-t border-gray-100 shrink-0">
            <button onClick={() => setFiltersOpen(false)} className="w-full bg-green text-white py-3 rounded-xl font-semibold btn-sweep hover:bg-[#237A34] transition-colors">
              Afficher {filtered.length} {filtered.length === 1 ? "coffret" : "coffrets"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
