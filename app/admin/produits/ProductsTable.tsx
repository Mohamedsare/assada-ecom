"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Eye, Package, Search, ChevronLeft, ChevronRight, Loader2, Check,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { adminDeleteProduct, adminToggleProductStatus } from "@/lib/supabase/actions";
import DeleteForm from "@/components/admin/DeleteForm";
import type { Product, Category, Brand } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  active:       "bg-green-100 text-[#020B27]",
  draft:        "bg-gray-100 text-gray-600",
  out_of_stock: "bg-red-100 text-red-700",
  hidden:       "bg-yellow-100 text-yellow-700",
};

const STATUS_LABELS: Record<string, string> = {
  active:       "Actif",
  draft:        "Brouillon",
  out_of_stock: "Rupture",
  hidden:       "Masqué",
};

const STATUS_OPTIONS = ["active", "draft", "out_of_stock", "hidden"] as const;

type SortKey = "recent" | "name" | "price_asc" | "price_desc" | "stock_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent",     label: "Plus récents" },
  { value: "name",       label: "Nom (A→Z)" },
  { value: "price_asc",  label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "stock_asc",  label: "Stock croissant" },
];

const PAGE_SIZE = 12;
const LOW_STOCK = 5;

export default function ProductsTable({
  products,
  categories,
  brands,
}: {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const lowStock = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK).length;
    const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
    return { total, active, lowStock, outOfStock };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = products.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (categoryId !== "all" && p.category_id !== categoryId) return false;
      if (brandId !== "all" && p.brand_id !== brandId) return false;
      if (q) {
        const haystack = `${p.name} ${p.sku ?? ""} ${p.brand?.name ?? ""} ${p.category?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "name":       return a.name.localeCompare(b.name);
        case "price_asc":  return a.current_price - b.current_price;
        case "price_desc": return b.current_price - a.current_price;
        case "stock_asc":  return a.stock_quantity - b.stock_quantity;
        default:           return 0; // "recent" — déjà trié par la requête
      }
    });
    return result;
  }, [products, search, status, categoryId, brandId, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Réinitialise la page quand on change un filtre
  const resetPage = () => setPage(1);

  const hasFilters = search || status !== "all" || categoryId !== "all" || brandId !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#020B27]">Gestion des produits</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{products.length} produits au total</p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="flex items-center gap-2 bg-[#B8925A] text-[#020B27] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#9E7A45] transition-colors"
        >
          <Plus size={16} />
          Ajouter un produit
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Produits" value={stats.total} tone="default" />
        <StatCard label="Actifs" value={stats.active} tone="green" />
        <StatCard label="Stock faible" value={stats.lowStock} tone="orange" />
        <StatCard label="En rupture" value={stats.outOfStock} tone="red" />
      </div>

      {/* Barre de filtres */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Rechercher un produit, une marque, un SKU…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect value={status} onChange={(v) => { setStatus(v); resetPage(); }} label="Statut">
            <option value="all">Tous les statuts</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </FilterSelect>
          <FilterSelect value={categoryId} onChange={(v) => { setCategoryId(v); resetPage(); }} label="Catégorie">
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FilterSelect>
          <FilterSelect value={brandId} onChange={(v) => { setBrandId(v); resetPage(); }} label="Marque">
            <option value="all">Toutes les marques</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </FilterSelect>
          <FilterSelect value={sort} onChange={(v) => setSort(v as SortKey)} label="Trier par">
            {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </FilterSelect>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27] mb-2">
            {hasFilters ? "Aucun produit ne correspond" : "Aucun produit"}
          </p>
          <p className="text-[#64748B] text-sm mb-6">
            {hasFilters
              ? "Essayez de modifier ou de réinitialiser les filtres."
              : "Ajoutez votre premier produit pour commencer à vendre"}
          </p>
          {hasFilters ? (
            <button
              onClick={() => { setSearch(""); setStatus("all"); setCategoryId("all"); setBrandId("all"); resetPage(); }}
              className="bg-[#B8925A] text-[#020B27] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#9E7A45] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <Link href="/admin/produits/nouveau" className="bg-[#B8925A] text-[#020B27] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#9E7A45] transition-colors">
              Ajouter un produit
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-[#64748B] font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {product.main_image_url ? (
                            <Image src={product.main_image_url} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#020B27] truncate max-w-48">{product.name}</p>
                          <div className="flex items-center gap-1.5">
                            {product.brand && <p className="text-xs text-[#64748B]">{product.brand.name}</p>}
                            {product.variants && product.variants.length > 0 && (
                              <span className="text-[10px] text-[#64748B] bg-gray-100 px-1.5 rounded">{product.variants.length} variantes</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[#64748B]">{product.category?.name ?? "—"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-[#020B27] whitespace-nowrap">{formatPrice(product.current_price)}</p>
                      {product.old_price && (
                        <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(product.old_price)}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        product.stock_quantity === 0 ? "text-red-600"
                          : product.stock_quantity <= LOW_STOCK ? "text-orange-600"
                          : "text-[#020B27]"
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusMenu product={product} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/produit/${product.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Voir sur le site">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/admin/produits/${product.id}/modifier`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Modifier">
                          <Pencil size={15} />
                        </Link>
                        <DeleteForm action={adminDeleteProduct.bind(null, product.id)} name={product.name} iconSize={15} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-50 text-sm">
            <p className="text-[#64748B]">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-[#020B27] font-medium">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "default" | "green" | "orange" | "red" }) {
  const tones: Record<string, string> = {
    default: "text-[#020B27]",
    green: "text-[#020B27]",
    orange: "text-orange-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-[#64748B] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function FilterSelect({
  value, onChange, label, children,
}: {
  value: string; onChange: (v: string) => void; label: string; children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white transition-colors"
    >
      {children}
    </select>
  );
}

/** Menu déroulant pour changer rapidement le statut d'un produit. */
function StatusMenu({ product }: { product: Product }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const change = (status: string) => {
    setOpen(false);
    if (status === product.status) return;
    startTransition(async () => {
      await adminToggleProductStatus(product.id, status);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${STATUS_STYLES[product.status]} disabled:opacity-60`}
        title="Changer le statut"
      >
        {pending && <Loader2 size={11} className="animate-spin" />}
        {STATUS_LABELS[product.status]}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-36 bg-white rounded-lg border border-gray-100 shadow-lg py-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => change(s)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#020B27] hover:bg-gray-50 transition-colors"
              >
                {STATUS_LABELS[s]}
                {s === product.status && <Check size={13} className="text-green" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
