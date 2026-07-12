"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Tag, X, Search, Loader2, Trash2, CornerDownRight, Layers } from "lucide-react";
import {
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminToggleCategoryActive,
} from "@/lib/supabase/actions";
import DeleteForm from "@/components/admin/DeleteForm";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { Category } from "@/types";

type Row = { cat: Category; depth: number };

export default function CategoriesContent({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [presetParentId, setPresetParentId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Regroupe par parent + tri (ordre d'affichage puis nom).
  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, Category[]>();
    for (const c of categories) {
      const key = c.parent_id ?? null;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name));
    }
    return map;
  }, [categories]);

  const roots = childrenByParent.get(null) ?? [];

  // Aplatis récursivement les descendants d'un axe (profondeur pour l'indentation).
  const descendants = (parentId: string, depth = 1): Row[] =>
    (childrenByParent.get(parentId) ?? []).flatMap((c) => [{ cat: c, depth }, ...descendants(c.id, depth + 1)]);

  const q = search.trim().toLowerCase();
  const matches = (c: Category) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);

  // Sections = un axe + ses descendants ; affichée si l'axe ou un descendant correspond à la recherche.
  const sections = roots
    .map((root) => ({ root, rows: descendants(root.id) }))
    .filter(({ root, rows }) => matches(root) || rows.some((r) => matches(r.cat)));

  const openCreateRoot = () => { setPresetParentId(null); setCreating(true); };
  const openCreateChild = (parentId: string) => { setPresetParentId(parentId); setCreating(true); };

  const subCount = categories.filter((c) => c.parent_id).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0A2A52]">Catégories</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {roots.length} axe{roots.length > 1 ? "s" : ""} · {subCount} sous-catégorie{subCount > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreateRoot}
          className="flex items-center gap-2 bg-green btn-sweep hover:bg-[#237A34] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Ajouter un axe
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une catégorie…"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
        />
      </div>

      {sections.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm py-12 text-center text-text-secondary text-sm">
          Aucune catégorie trouvée.
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(({ root, rows }) => (
            <div key={root.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* En-tête de l'axe */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-11 h-11 bg-green/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {root.image_url ? (
                    <Image src={root.image_url} alt={root.name} width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    <Layers size={18} className="text-green" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#0A2A52] truncate">{root.name}</p>
                  <p className="text-xs text-text-secondary">
                    {rows.length} sous-catégorie{rows.length > 1 ? "s" : ""}
                  </p>
                </div>
                <ActiveToggle category={root} />
                <button
                  onClick={() => openCreateChild(root.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-green border border-green/40 hover:bg-green/10 px-3 py-1.5 rounded-lg transition-colors"
                  title="Ajouter une sous-catégorie à cet axe"
                >
                  <Plus size={14} /> Sous-catégorie
                </button>
                <button
                  onClick={() => setEditing(root)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A2A52] transition-colors"
                  title="Modifier l'axe"
                >
                  <Pencil size={15} />
                </button>
              </div>

              {/* Sous-catégories de l'axe */}
              {rows.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-text-secondary">
                  Aucune sous-catégorie. Cliquez sur « Sous-catégorie » pour en ajouter une.
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {rows.map(({ cat, depth }) => {
                    const count = counts[cat.id] ?? 0;
                    return (
                      <li key={cat.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <span style={{ width: (depth - 1) * 20 }} className="shrink-0" aria-hidden="true" />
                        {depth > 1 && <CornerDownRight size={13} className="text-gray-300 shrink-0" />}
                        <div className="w-9 h-9 bg-green/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {cat.image_url ? (
                            <Image src={cat.image_url} alt={cat.name} width={36} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <Tag size={14} className="text-green" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#0A2A52] truncate">{cat.name}</p>
                          <p className="text-xs text-text-secondary truncate">{cat.slug}</p>
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${count > 0 ? "text-[#0A2A52]" : "text-gray-400"}`}>
                          {count} produit{count > 1 ? "s" : ""}
                        </span>
                        <div className="shrink-0"><ActiveToggle category={cat} /></div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openCreateChild(cat.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green transition-colors"
                            title="Ajouter une sous-catégorie"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => setEditing(cat)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A2A52] transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          {count > 0 ? (
                            <button disabled className="p-1.5 rounded-lg text-gray-300 cursor-not-allowed" title={`Impossible de supprimer : ${count} produit(s) rattaché(s)`}>
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <DeleteForm action={adminDeleteCategory.bind(null, cat.id)} name={cat.name} iconSize={15} />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <CategoryModal
          category={editing}
          categories={categories}
          presetParentId={presetParentId}
          onClose={() => { setCreating(false); setEditing(null); setPresetParentId(null); }}
        />
      )}
    </div>
  );
}

function ActiveToggle({ category }: { category: Category }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(category.is_active);

  const toggle = () => {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      await adminToggleCategoryActive(category.id, next);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors disabled:opacity-60 shrink-0 ${
        active ? "bg-green-50 text-green hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
      title="Cliquer pour changer le statut"
    >
      {pending && <Loader2 size={11} className="animate-spin" />}
      {active ? "Actif" : "Inactif"}
    </button>
  );
}

function CategoryModal({ category, categories, presetParentId, onClose }: { category: Category | null; categories: Category[]; presetParentId?: string | null; onClose: () => void }) {
  const isEdit = !!category;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateCategory(category!.id, formData)
        : await adminCreateCategory(formData);
      if (res?.error) setError(res.error);
      else onClose();
    });
  };

  const defaultParent = category?.parent_id ?? presetParentId ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-[#0A2A52]">{isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0A2A52] transition-colors"><X size={20} /></button>
        </div>

        <form action={action} className="p-5 space-y-4">
          <Field label="Nom" name="name" defaultValue={category?.name} placeholder="Parfums" required />
          <div>
            <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Description</label>
            <textarea name="description" defaultValue={category?.description ?? ""} rows={2} placeholder="Description courte…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
          </div>

          <ImageUploadField name="image_url" bucket="categories" label="Image (affichée dans les cercles « Nos Univers »)" defaultValue={category?.image_url} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Axe / catégorie parente</label>
              <select name="parent_id" defaultValue={defaultParent} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">Aucune (axe principal)</option>
                {categories.filter((c) => c.id !== category?.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Field label="Ordre d'affichage" name="sort_order" type="number" defaultValue={String(category?.sort_order ?? 0)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Statut</label>
            <select name="is_active" defaultValue={category && !category.is_active ? "false" : "true"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="bg-green btn-sweep hover:bg-[#237A34] disabled:opacity-60 text-[#0A2A52] text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la catégorie"}
            </button>
            <button type="button" onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required, defaultValue }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
    </div>
  );
}
