"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Boxes, Search, AlertTriangle, PackageX, Check, Minus, Plus } from "lucide-react";
import { adminUpdateStock } from "@/lib/supabase/actions";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

const LOW_STOCK = 5;

export default function StocksContent({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const stats = useMemo(() => {
    const out = products.filter((p) => p.stock_quantity === 0).length;
    const low = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < LOW_STOCK).length;
    const value = products.reduce((s, p) => s + p.current_price * p.stock_quantity, 0);
    return { total: products.length, out, low, value };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(query.toLowerCase());
      const matchFilter =
        filter === "all" ? true :
        filter === "out" ? p.stock_quantity === 0 :
        p.stock_quantity > 0 && p.stock_quantity < LOW_STOCK;
      return matchQuery && matchFilter;
    });
  }, [products, query, filter]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#020B27]">Gestion des stocks</h1>
        <p className="text-text-secondary text-sm mt-0.5">Suivez et ajustez les niveaux de stock en temps réel</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi icon={Boxes} label="Produits" value={String(stats.total)} color="text-blue-600 bg-blue-50" />
        <Kpi icon={AlertTriangle} label="Stock faible" value={String(stats.low)} color="text-orange-600 bg-orange-50" />
        <Kpi icon={PackageX} label="En rupture" value={String(stats.out)} color="text-red-600 bg-red-50" />
        <Kpi icon={Boxes} label="Valeur du stock" value={formatPrice(stats.value)} color="text-green bg-green-50" />
      </div>

      {/* Barre filtres */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5">
          {([["all", "Tous"], ["low", "Stock faible"], ["out", "Rupture"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === k ? "bg-night text-white" : "bg-white border border-gray-200 text-text-secondary hover:bg-gray-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-64">
          <Search size={15} className="text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit / SKU..."
            className="bg-transparent text-sm outline-none flex-1 text-[#020B27]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Boxes size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27]">Aucun produit</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Produit", "SKU", "Prix", "Stock", "Ajuster", "Statut"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => <StockRow key={p.id} product={p} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StockRow({ product }: { product: Product }) {
  const [stock, setStock] = useState(product.stock_quantity);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = stock !== product.stock_quantity;

  const save = () => {
    startTransition(async () => {
      await adminUpdateStock(product.id, stock);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const badge =
    stock === 0 ? { label: "Rupture", cls: "bg-red-50 text-red-600" } :
    stock < LOW_STOCK ? { label: "Faible", cls: "bg-orange-50 text-orange-600" } :
    { label: "En stock", cls: "bg-green-50 text-green" };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <Link href={`/admin/produits/${product.id}/modifier`} className="text-sm font-medium text-[#020B27] hover:text-green transition-colors line-clamp-1">{product.name}</Link>
        <p className="text-xs text-text-secondary">{product.category?.name ?? "—"}</p>
      </td>
      <td className="py-3 px-4"><span className="text-xs text-text-secondary">{product.sku ?? "—"}</span></td>
      <td className="py-3 px-4"><span className="text-sm font-semibold text-[#020B27]">{formatPrice(product.current_price)}</span></td>
      <td className="py-3 px-4"><span className="text-sm font-bold text-[#020B27]">{stock}</span></td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setStock((s) => Math.max(0, s - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50" aria-label="Diminuer"><Minus size={12} /></button>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
              className="w-12 text-center text-sm outline-none border-x border-gray-200 py-1"
            />
            <button onClick={() => setStock((s) => s + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50" aria-label="Augmenter"><Plus size={12} /></button>
          </div>
          {dirty && (
            <button onClick={save} disabled={pending} className="text-xs font-semibold bg-green text-[#020B27] px-2.5 py-1.5 rounded-lg hover:bg-[#9E7A45] disabled:opacity-60 transition-colors">
              {pending ? "…" : "OK"}
            </button>
          )}
          {saved && <Check size={15} className="text-green" />}
        </div>
      </td>
      <td className="py-3 px-4"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span></td>
    </tr>
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: typeof Boxes; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-[#020B27] leading-none truncate">{value}</p>
        <p className="text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  );
}
