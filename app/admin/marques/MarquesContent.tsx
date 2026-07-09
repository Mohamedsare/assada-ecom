"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Award, X, Search, Loader2, Trash2 } from "lucide-react";
import {
  adminCreateBrand, adminUpdateBrand, adminDeleteBrand, adminToggleBrandActive,
} from "@/lib/supabase/actions";
import DeleteForm from "@/components/admin/DeleteForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { Brand } from "@/types";

export default function MarquesContent({
  brands,
  counts,
}: {
  brands: Brand[];
  counts: Record<string, number>;
}) {
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
  }, [brands, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#020B27]">Marques</h1>
          <p className="text-text-secondary text-sm mt-0.5">{brands.length} marques</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Ajouter une marque
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une marque…"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
        />
      </div>

      {brands.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Award size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27] mb-1">Aucune marque</p>
          <p className="text-text-secondary text-sm">Ajoutez votre première marque.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center text-text-secondary text-sm">
          Aucune marque ne correspond à « {search} ».
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filtered.map((brand) => {
            const count = counts[brand.id] ?? 0;
            return (
              <div key={brand.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 text-center group">
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {brand.logo_url ? (
                    <Image src={brand.logo_url} alt={brand.name} width={56} height={56} className="object-contain" />
                  ) : (
                    <Award size={24} className="text-green" />
                  )}
                </div>
                <p className="font-semibold text-[#020B27] text-sm">{brand.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">{count} produit{count !== 1 ? "s" : ""}</p>
                <div className="mt-2">
                  <ActiveToggle brand={brand} />
                </div>
                <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditing(brand)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  {count > 0 ? (
                    <button
                      disabled
                      className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed"
                      title={`Impossible de supprimer : ${count} produit(s) rattaché(s)`}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <DeleteForm action={adminDeleteBrand.bind(null, brand.id)} name={brand.name} iconSize={14} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <BrandModal brand={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function ActiveToggle({ brand }: { brand: Brand }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(brand.is_active);

  const toggle = () => {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      await adminToggleBrandActive(brand.id, next);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-colors disabled:opacity-60 ${
        active ? "bg-green-50 text-green hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
      title="Cliquer pour changer le statut"
    >
      {pending && <Loader2 size={11} className="animate-spin" />}
      {active ? "Actif" : "Inactif"}
    </button>
  );
}

function BrandModal({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const isEdit = !!brand;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateBrand(brand!.id, formData)
        : await adminCreateBrand(formData);
      if (res?.error) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-[#020B27]">{isEdit ? "Modifier la marque" : "Nouvelle marque"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#020B27] transition-colors"><X size={20} /></button>
        </div>

        <form action={action} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#020B27] mb-1.5">Nom<span className="text-red-500 ml-0.5">*</span></label>
            <input name="name" defaultValue={brand?.name} required placeholder="L'Oréal Paris" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#020B27] mb-1.5">Description</label>
            <textarea name="description" defaultValue={brand?.description ?? ""} rows={2} placeholder="Description courte…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
          </div>

          <ImageUploadField name="logo_url" bucket="brands" label="Logo" defaultValue={brand?.logo_url} />

          <div>
            <label className="block text-sm font-medium text-[#020B27] mb-1.5">Statut</label>
            <select name="is_active" defaultValue={brand && !brand.is_active ? "false" : "true"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="bg-green hover:bg-[#9E7A45] disabled:opacity-60 text-[#020B27] text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la marque"}
            </button>
            <button type="button" onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
