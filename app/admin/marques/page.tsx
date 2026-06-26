import type { Metadata } from "next";
import Image from "next/image";
import { Plus, Pencil, Trash2, Award } from "lucide-react";
import { getAllBrands } from "@/lib/supabase/queries";
import { adminDeleteBrand } from "@/lib/supabase/actions";

export const metadata: Metadata = { title: "Gestion marques" };

export default async function AdminMarquesPage() {
  const brands = await getAllBrands();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Marques</h1>
          <p className="text-text-secondary text-sm mt-0.5">{brands.length} marques</p>
        </div>
        <button className="flex items-center gap-2 bg-green hover:bg-[#15803d] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Ajouter une marque
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {brands.map((brand) => (
          <div key={brand.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center group">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {brand.logo_url ? (
                <Image src={brand.logo_url} alt={brand.name} width={56} height={56} className="object-contain" />
              ) : (
                <Award size={24} className="text-green" />
              )}
            </div>
            <p className="font-semibold text-[#0F172A] text-sm">{brand.name}</p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${brand.is_active ? "bg-green-50 text-green" : "bg-gray-100 text-gray-500"}`}>
              {brand.is_active ? "Actif" : "Inactif"}
            </span>
            <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors" title="Modifier">
                <Pencil size={14} />
              </button>
              <form action={adminDeleteBrand.bind(null, brand.id)}>
                <button
                  type="submit"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                  title="Supprimer"
                  onClick={(e) => { if (!confirm(`Supprimer "${brand.name}" ?`)) e.preventDefault(); }}
                >
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
