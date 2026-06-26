import type { Metadata } from "next";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { getAllCategories } from "@/lib/supabase/queries";
import { adminDeleteCategory } from "@/lib/supabase/actions";

export const metadata: Metadata = { title: "Gestion catégories" };

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Catégories</h1>
          <p className="text-text-secondary text-sm mt-0.5">{categories.length} catégories</p>
        </div>
        <button className="flex items-center gap-2 bg-green hover:bg-[#15803d] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} /> Ajouter une catégorie
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Catégorie", "Slug", "Ordre", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green/10 rounded-lg flex items-center justify-center shrink-0">
                        <Tag size={15} className="text-green" />
                      </div>
                      <span className="text-sm font-medium text-[#0F172A]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="text-sm text-text-secondary">{cat.slug}</span></td>
                  <td className="py-3 px-4"><span className="text-sm text-text-secondary">{cat.sort_order}</span></td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.is_active ? "bg-green-50 text-green" : "bg-gray-100 text-gray-500"}`}>
                      {cat.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors" title="Modifier">
                        <Pencil size={15} />
                      </button>
                      <form action={adminDeleteCategory.bind(null, cat.id)}>
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                          title="Supprimer"
                          onClick={(e) => { if (!confirm(`Supprimer "${cat.name}" ?`)) e.preventDefault(); }}
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
    </div>
  );
}
