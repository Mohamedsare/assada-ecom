"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Eye, Package, Search, ChevronLeft, ChevronRight, Loader2, Check,
  X, ExternalLink, Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { adminDeleteProduct, adminToggleProductStatus, adminQuickUpdateProduct } from "@/lib/supabase/actions";
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
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string } | null>(null);

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
          className="flex items-center gap-2 bg-[#B8925A] text-white px-4 py-2.5 rounded-lg text-sm font-medium btn-sweep hover:bg-[#9E7A45] transition-colors"
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
              className="bg-[#B8925A] text-white px-5 py-2.5 rounded-lg text-sm font-medium btn-sweep hover:bg-[#9E7A45] transition-colors"
            >
              Réinitialiser les filtres
            </button>
          ) : (
            <Link href="/admin/produits/nouveau" className="bg-[#B8925A] text-white px-5 py-2.5 rounded-lg text-sm font-medium btn-sweep hover:bg-[#9E7A45] transition-colors">
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
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => product.main_image_url && setZoomImage({ url: product.main_image_url, name: product.name })}
                        disabled={!product.main_image_url}
                        title={product.main_image_url ? "Agrandir l'image" : undefined}
                        className={`flex items-center gap-3 text-left ${product.main_image_url ? "cursor-zoom-in" : "cursor-default"}`}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {product.main_image_url ? (
                            <Image src={product.main_image_url} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-[#020B27]">{product.name}</span>
                          <span className="flex items-center gap-1.5">
                            {product.brand && <span className="text-xs text-[#64748B]">{product.brand.name}</span>}
                            {product.variants && product.variants.length > 0 && (
                              <span className="text-[10px] text-[#64748B] bg-gray-100 px-1.5 rounded">{product.variants.length} variantes</span>
                            )}
                          </span>
                        </div>
                      </button>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-sm text-[#64748B]">{product.category?.name ?? "—"}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-[#020B27] whitespace-nowrap">{formatPrice(product.current_price)}</p>
                      {product.old_price && (
                        <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(product.old_price)}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        product.stock_quantity === 0 ? "text-red-600"
                          : product.stock_quantity <= LOW_STOCK ? "text-orange-600"
                          : "text-[#020B27]"
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusMenu product={product} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setPreviewProduct(product)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Aperçu rapide">
                          <Eye size={15} />
                        </button>
                        <button type="button" onClick={() => setQuickEditProduct(product)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-[#B8925A] transition-colors" title="Modification rapide">
                          <Zap size={15} />
                        </button>
                        <Link href={`/admin/produits/${product.id}/modifier`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Modifier (fiche complète)">
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

      {previewProduct && (
        <ProductPreviewModal product={previewProduct} onClose={() => setPreviewProduct(null)} />
      )}

      {quickEditProduct && (
        <QuickEditModal product={quickEditProduct} onClose={() => setQuickEditProduct(null)} />
      )}

      {zoomImage && (
        <ImageZoomModal url={zoomImage.url} name={zoomImage.name} onClose={() => setZoomImage(null)} />
      )}
    </div>
  );
}

/** Lightbox léger : agrandit l'image d'un produit à une taille modérée. */
function ImageZoomModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100">
          <p className="text-sm font-medium text-[#020B27] truncate">{name}</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors shrink-0" title="Fermer (Échap)">
            <X size={18} />
          </button>
        </div>
        <div className="relative aspect-square bg-gray-50">
          <Image src={url} alt={name} fill sizes="384px" className="object-contain" />
        </div>
      </div>
    </div>
  );
}

/** Modification rapide des champs courants d'un produit, en modale (sans quitter la liste). */
function QuickEditModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [currentPrice, setCurrentPrice] = useState(String(product.current_price));
  const [oldPrice, setOldPrice] = useState(product.old_price ? String(product.old_price) : "");
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [status, setStatus] = useState<string>(product.status);
  const [isNew, setIsNew] = useState(product.is_new);
  const [isPromo, setIsPromo] = useState(product.is_promo);
  const [isFeatured, setIsFeatured] = useState(product.is_featured);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const save = () => {
    setError(null);
    startTransition(async () => {
      const res = await adminQuickUpdateProduct(product.id, {
        name: name.trim(),
        current_price: Number(currentPrice),
        old_price: oldPrice ? Number(oldPrice) : null,
        stock_quantity: Number(stock) || 0,
        status,
        is_new: isNew,
        is_promo: isPromo,
        is_featured: isFeatured,
      });
      if (res?.error) { setError(res.error); return; }
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="font-bold text-[#020B27] flex items-center gap-1.5"><Zap size={16} className="text-[#B8925A]" /> Modification rapide</h2>
            <p className="text-xs text-[#64748B] truncate">{product.name}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Fermer (Échap)">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Nom">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix actuel (DH)">
              <input type="number" min="0" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
            </Field>
            <Field label="Ancien prix (DH)">
              <input type="number" min="0" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="—" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock">
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
            </Field>
            <Field label="Statut">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green bg-white transition-colors">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Toggle label="Nouveau" active={isNew} onClick={() => setIsNew((v) => !v)} />
            <Toggle label="Promo" active={isPromo} onClick={() => setIsPromo((v) => !v)} />
            <Toggle label="Vedette" active={isFeatured} onClick={() => setIsFeatured((v) => !v)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button type="button" onClick={onClose} disabled={pending} className="px-3 py-2 rounded-lg text-sm text-[#020B27] border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60">
            Annuler
          </button>
          <button type="button" onClick={save} disabled={pending} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#B8925A] text-white btn-sweep hover:bg-[#9E7A45] transition-colors disabled:opacity-60">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#020B27] mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${active ? "bg-[#B8925A] text-white border-[#B8925A]" : "bg-white text-[#64748B] border-gray-200 hover:border-gray-300"}`}
    >
      {label}
    </button>
  );
}

/** Aperçu rapide d'un produit en modale (données déjà chargées, aucune navigation). */
function ProductPreviewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const gallery = useMemo(() => {
    const urls = (product.images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.image_url);
    if (product.main_image_url && !urls.includes(product.main_image_url)) urls.unshift(product.main_image_url);
    return urls;
  }, [product]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const discount = product.old_price && product.old_price > product.current_price
    ? Math.round(((product.old_price - product.current_price) / product.old_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-[#020B27] truncate">Aperçu du produit</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Fermer (Échap)">
            <X size={18} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5 p-5">
          {/* Galerie */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {gallery[active] ? (
                <Image src={gallery[active]} alt={product.name} fill sizes="400px" className="object-cover" />
              ) : (
                <Package size={40} className="text-gray-300" />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {gallery.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? "border-[#B8925A]" : "border-transparent"}`}
                  >
                    <Image src={url} alt={`${product.name} ${i + 1}`} fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[product.status]}`}>{STATUS_LABELS[product.status]}</span>
              {product.is_new && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Nouveau</span>}
              {product.is_promo && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Promo</span>}
              {product.is_featured && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Vedette</span>}
            </div>

            {product.brand && <p className="text-xs text-[#64748B]">{product.brand.name}</p>}
            <h3 className="text-lg font-bold text-[#020B27] leading-snug">{product.name}</h3>
            <p className="text-sm text-[#64748B]">{product.category?.name ?? "—"}</p>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#020B27]">{formatPrice(product.current_price)}</span>
              {product.old_price && product.old_price > product.current_price && (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.old_price)}</span>
                  <span className="text-xs font-semibold text-red-600">-{discount}%</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className={`font-medium ${product.stock_quantity === 0 ? "text-red-600" : product.stock_quantity <= LOW_STOCK ? "text-orange-600" : "text-[#020B27]"}`}>
                Stock : {product.stock_quantity}
              </span>
              {product.sku && <span className="text-[#64748B]">SKU : {product.sku}</span>}
            </div>

            {product.short_description && <p className="text-sm text-[#020B27]">{product.short_description}</p>}
            {product.description && <p className="text-sm text-[#64748B] whitespace-pre-line">{product.description}</p>}

            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#020B27] mb-1">Variantes ({product.variants.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <span key={v.id} className="text-[11px] bg-gray-100 text-[#020B27] px-2 py-0.5 rounded">
                      {[v.color, v.size].filter(Boolean).join(" · ") || "Variante"} — {v.stock_quantity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pied — actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 sticky bottom-0 bg-white">
          <Link href={`/produit/${product.slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#020B27] border border-gray-200 hover:bg-gray-50 transition-colors">
            <ExternalLink size={15} /> Voir sur le site
          </Link>
          <Link href={`/admin/produits/${product.id}/modifier`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[#B8925A] text-white btn-sweep hover:bg-[#9E7A45] transition-colors">
            <Pencil size={15} /> Modifier
          </Link>
        </div>
      </div>
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
