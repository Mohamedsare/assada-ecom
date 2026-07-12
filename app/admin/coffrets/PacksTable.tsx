"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Gift, Search, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { adminDeletePack } from "@/lib/supabase/actions";
import DeleteForm from "@/components/admin/DeleteForm";
import type { Product } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  active:       "bg-green-100 text-[#0A2A52]",
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

export default function PacksTable({ packs }: { packs: Product[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return packs;
    return packs.filter((p) => p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q));
  }, [packs, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2A52] flex items-center gap-2">
            <Gift size={22} className="text-[#2F9E44]" /> Coffrets cadeaux
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">{packs.length} coffret{packs.length !== 1 ? "s" : ""} — ensembles de produits vendus ensemble</p>
        </div>
        <Link
          href="/admin/coffrets/nouveau"
          className="flex items-center gap-2 bg-[#2F9E44] text-white px-4 py-2.5 rounded-lg text-sm font-medium btn-sweep hover:bg-[#237A34] transition-colors"
        >
          <Plus size={16} />
          Nouveau coffret
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un coffret…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Gift size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0A2A52] mb-2">{search ? "Aucun coffret ne correspond" : "Aucun coffret"}</p>
          <p className="text-[#64748B] text-sm mb-6">
            {search ? "Essayez un autre terme de recherche." : "Créez votre premier coffret cadeau en regroupant plusieurs produits."}
          </p>
          {!search && (
            <Link href="/admin/coffrets/nouveau" className="bg-[#2F9E44] text-white px-5 py-2.5 rounded-lg text-sm font-medium btn-sweep hover:bg-[#237A34] transition-colors">
              Nouveau coffret
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Coffret", "Produits inclus", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-[#64748B] font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((pack) => {
                  const itemCount = pack.pack_items?.length ?? 0;
                  return (
                    <tr key={pack.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {pack.main_image_url
                              ? <Image src={pack.main_image_url} alt={pack.name} width={40} height={40} className="object-cover w-full h-full" />
                              : <Gift size={16} className="text-gray-400" />}
                          </div>
                          <span className="block text-sm font-medium text-[#0A2A52]">{pack.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {itemCount === 0 ? (
                            <span className="text-xs text-red-500 flex items-center gap-1"><Package size={12} /> Vide</span>
                          ) : (
                            <>
                              {(pack.pack_items ?? []).slice(0, 3).map((it) => (
                                <span key={it.id} className="text-[11px] bg-gray-100 text-[#0A2A52] px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                  {it.quantity}× {it.product?.name ?? "?"}
                                </span>
                              ))}
                              {itemCount > 3 && <span className="text-[11px] text-[#64748B]">+{itemCount - 3}</span>}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-[#0A2A52] whitespace-nowrap">{formatPrice(pack.current_price)}</p>
                        {pack.old_price && (
                          <p className="text-xs text-gray-400 line-through whitespace-nowrap">{formatPrice(pack.old_price)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${pack.stock_quantity === 0 ? "text-red-600" : "text-[#0A2A52]"}`}>{pack.stock_quantity}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[pack.status]}`}>{STATUS_LABELS[pack.status]}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Link href={`/produit/${pack.slug}`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A2A52] transition-colors" title="Voir sur le site">
                            <Gift size={15} />
                          </Link>
                          <Link href={`/admin/coffrets/${pack.id}/modifier`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A2A52] transition-colors" title="Modifier">
                            <Pencil size={15} />
                          </Link>
                          <DeleteForm action={adminDeletePack.bind(null, pack.id)} name={pack.name} iconSize={15} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
