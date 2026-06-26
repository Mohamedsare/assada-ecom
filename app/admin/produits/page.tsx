import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Eye, Trash2, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAdminProducts } from "@/lib/supabase/queries";
import { adminDeleteProduct } from "@/lib/supabase/actions";

export const metadata: Metadata = { title: "Gestion produits" };

const STATUS_STYLES: Record<string, string> = {
  active:       "bg-green-100 text-[#16A34A]",
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

export default async function AdminProduitsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Gestion des produits</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{products.length} produits</p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="flex items-center gap-2 bg-[#16A34A] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803d] transition-colors"
        >
          <Plus size={16} />
          Ajouter un produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A] mb-2">Aucun produit</p>
          <p className="text-[#64748B] text-sm mb-6">Ajoutez votre premier produit pour commencer à vendre</p>
          <Link href="/admin/produits/nouveau" className="bg-[#16A34A] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803d] transition-colors">
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Produit", "Catégorie", "Prix", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-[#64748B] font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {product.main_image_url ? (
                            <Image
                              src={product.main_image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A] truncate max-w-48">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-[#64748B]">{product.brand.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[#64748B]">{product.category?.name ?? "—"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-bold text-[#16A34A]">{formatPrice(product.current_price)}</p>
                        {product.old_price && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.old_price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        product.stock_quantity <= 3
                          ? "text-red-600"
                          : product.stock_quantity <= 10
                          ? "text-orange-600"
                          : "text-[#0F172A]"
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[product.status]}`}>
                        {STATUS_LABELS[product.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/produit/${product.slug}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#16A34A] transition-colors"
                          title="Voir"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={`/admin/produits/${product.id}/modifier`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </Link>
                        <form action={adminDeleteProduct.bind(null, product.id)}>
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-[#EF4444] transition-colors"
                            title="Supprimer"
                            onClick={(e) => {
                              if (!confirm(`Supprimer "${product.name}" ?`)) e.preventDefault();
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
