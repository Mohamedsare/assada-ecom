"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";
import { getWhatsAppUrl } from "@/lib/utils";

export default function RechercheContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [input, setInput] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        brand:brands(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("status", "active")
      .or(`name.ilike.%${q}%,short_description.ilike.%${q}%`)
      .order("created_at", { ascending: false });

    setResults((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(input.trim())}`);
      doSearch(input.trim());
    }
  };

  const query = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-[#020B27] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Résultats de recherche</h1>
          {query && (
            <p className="text-gray-400 mb-4">
              Tous les résultats pour &quot;<span className="text-white">{query}</span>&quot;
            </p>
          )}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Rechercher un produit, marque, catégorie..."
                className="w-full bg-white text-[#0F172A] placeholder-gray-400 rounded-xl pl-10 pr-10 py-3 text-sm outline-none"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => { setInput(""); setResults([]); setSearched(false); router.push("/recherche"); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#16A34A] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#15803d] transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              <span className="hidden sm:inline">Rechercher</span>
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-wrap gap-2 mb-6">
          {["Chaussures", "Vêtements", "Électroniques", "Accessoires", "PC"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setInput(cat);
                router.push(`/recherche?q=${encodeURIComponent(cat)}`);
                doSearch(cat);
              }}
              className="text-sm px-4 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : !searched ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4 text-gray-200" />
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Que cherchez-vous ?</h2>
            <p className="text-[#64748B]">Entrez un mot-clé pour trouver vos produits</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">
              Aucun résultat pour &quot;{query}&quot;
            </h2>
            <p className="text-[#64748B] mb-6">Vérifiez l&apos;orthographe ou essayez d&apos;autres mots-clés</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/boutique"
                className="bg-[#16A34A] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#15803d] transition-colors"
              >
                Voir toute la boutique
              </Link>
              <Link
                href={getWhatsAppUrl(`Bonjour Odm's Shopping, je cherche "${query}". Est-ce que vous l'avez ?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Contacter WhatsApp
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[#64748B] text-sm">
                <span className="font-bold text-[#0F172A]">{results.length}</span> résultat{results.length !== 1 ? "s" : ""} pour &quot;{query}&quot;
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
