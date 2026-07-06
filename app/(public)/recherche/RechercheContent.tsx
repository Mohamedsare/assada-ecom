"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Search, X, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { useProductSearch } from "@/hooks/useProductSearch";
import { calculateDiscount, getWhatsAppUrl } from "@/lib/utils";

const QUICK = ["Parfum", "Soin visage", "Maquillage", "Pommade", "Déodorant", "Soin cheveux", "Coffret"];

type Sort = "pertinence" | "price-asc" | "price-desc" | "offers";
const SORTS: { key: Sort; label: string }[] = [
  { key: "pertinence", label: "Pertinence" },
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "offers", label: "Meilleures offres" },
];

export default function RechercheContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [input, setInput] = useState(initialQuery);
  const [sort, setSort] = useState<Sort>("pertinence");

  const { results, loading } = useProductSearch(input, { limit: 48, debounce: 250 });
  const hasQuery = input.trim().length >= 2;

  // Reflète la requête dans l'URL (partageable) sans recharger la page
  useEffect(() => {
    const t = setTimeout(() => {
      const q = input.trim();
      const url = q ? `/recherche?q=${encodeURIComponent(q)}` : "/recherche";
      window.history.replaceState(null, "", url);
    }, 400);
    return () => clearTimeout(t);
  }, [input]);

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sort === "price-asc") arr.sort((a, b) => a.current_price - b.current_price);
    else if (sort === "price-desc") arr.sort((a, b) => b.current_price - a.current_price);
    else if (sort === "offers")
      arr.sort(
        (a, b) =>
          (b.old_price ? calculateDiscount(b.old_price, b.current_price) : 0) -
          (a.old_price ? calculateDiscount(a.old_price, a.current_price) : 0)
      );
    return arr;
  }, [results, sort]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero + barre de recherche */}
      <div className="bg-[#B8925A] text-[#020B27] py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Rechercher</h1>
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              placeholder="Rechercher un produit, une marque, une catégorie…"
              className="w-full bg-white text-[#020B27] placeholder-gray-400 rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:ring-2 focus:ring-green"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 size={16} className="animate-spin text-green" />
              ) : input ? (
                <button onClick={() => setInput("")} aria-label="Effacer" className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              ) : null}
            </span>
          </div>

          {/* Chips rapides */}
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK.map((cat) => (
              <button
                key={cat}
                onClick={() => setInput(cat)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 hover:border-green/50 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barre résultats + tri */}
        {hasQuery && !loading && results.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <p className="text-[#64748B] text-sm">
              <span className="font-bold text-[#020B27]">{results.length}</span> résultat{results.length !== 1 ? "s" : ""} pour « {input.trim()} »
            </p>
            <label className="flex items-center gap-2 text-sm">
              <SlidersHorizontal size={15} className="text-[#64748B]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#020B27] outline-none focus:border-green"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* États */}
        {!hasQuery ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-bold text-[#020B27] mb-2">Que cherchez-vous ?</h2>
            <p className="text-[#64748B]">Tapez au moins 2 caractères — les résultats s&apos;affichent instantanément.</p>
          </div>
        ) : loading && results.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#020B27] mb-2">Aucun résultat pour « {input.trim()} »</h2>
            <p className="text-[#64748B] mb-6">Vérifiez l&apos;orthographe ou essayez d&apos;autres mots-clés.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/boutique" className="bg-green text-[#020B27] px-6 py-2.5 rounded-xl font-medium hover:bg-[#9E7A45] transition-colors">
                Voir toute la boutique
              </Link>
              <Link
                href={getWhatsAppUrl(`Bonjour RYTA, je cherche "${input.trim()}". Est-ce que vous l'avez ?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#B8925A] text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Contacter WhatsApp
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
