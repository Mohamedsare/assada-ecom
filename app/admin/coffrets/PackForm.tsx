"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Minus, Trash2, Package, Gift, Sparkles, Loader2 } from "lucide-react";
import { adminCreatePack, adminUpdatePack, generatePackInfo, generateProductInfo } from "@/lib/supabase/actions";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import { formatPrice } from "@/lib/utils";
import type { Product, Category } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Actif" },
  { value: "draft", label: "Brouillon" },
  { value: "out_of_stock", label: "Rupture" },
  { value: "hidden", label: "Masqué" },
];

type Selected = { product_id: string; quantity: number };

export default function PackForm({
  pack,
  categories,
  products,
}: {
  pack?: Product | null;
  categories: Category[];
  products: Product[];
}) {
  const isEdit = !!pack;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Champs remplis automatiquement par l'IA — donc contrôlés.
  const [name, setName] = useState(pack?.name ?? "");
  const [shortDesc, setShortDesc] = useState(pack?.short_description ?? "");
  const [desc, setDesc] = useState(pack?.description ?? "");
  const [seoTitle, setSeoTitle] = useState(pack?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(pack?.seo_description ?? "");
  const [currentPrice, setCurrentPrice] = useState(pack ? String(pack.current_price) : "");
  const [oldPrice, setOldPrice] = useState(pack?.old_price ? String(pack.old_price) : "");
  const [categoryId, setCategoryId] = useState(pack?.category_id ?? "");

  const initialImages = (pack?.images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.image_url);
  if (!initialImages.length && pack?.main_image_url) initialImages.push(pack.main_image_url);

  // Photo principale (méthode 1 : pack créé depuis une photo → analyse IA).
  const [imageUrl, setImageUrl] = useState(initialImages[0] ?? "");

  // Composition initiale du pack
  const [selected, setSelected] = useState<Selected[]>(
    (pack?.pack_items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((it) => ({ product_id: it.product_id, quantity: it.quantity })),
  );
  const [pickerSearch, setPickerSearch] = useState("");

  const productById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.product_id)), [selected]);

  const searchResults = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => !selectedIds.has(p.id) && p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [products, pickerSearch, selectedIds]);

  const addProduct = (id: string) => {
    setSelected((prev) => [...prev, { product_id: id, quantity: 1 }]);
    setPickerSearch("");
  };
  const removeProduct = (id: string) =>
    setSelected((prev) => prev.filter((s) => s.product_id !== id));
  const setQty = (id: string, qty: number) =>
    setSelected((prev) => prev.map((s) => (s.product_id === id ? { ...s, quantity: Math.max(1, qty) } : s)));

  // Somme indicative des prix des produits composant le pack (aide à fixer le prix du coffret)
  const componentsTotal = useMemo(
    () => selected.reduce((sum, s) => sum + (productById.get(s.product_id)?.current_price ?? 0) * s.quantity, 0),
    [selected, productById],
  );

  // Génération IA des détails à partir de la composition du coffret.
  const [aiPending, startAi] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDone, setAiDone] = useState(false);

  // Arrondi « joli » (au 5 sous 100, sinon au 10).
  const roundNice = (v: number) => {
    if (v <= 0) return 0;
    const step = v < 100 ? 5 : 10;
    return Math.round(v / step) * step;
  };

  const applyText = (d: { name: string; short_description: string; description: string; seo_title: string; seo_description: string }) => {
    setName(d.name);
    setShortDesc(d.short_description);
    setDesc(d.description);
    setSeoTitle(d.seo_title);
    setSeoDesc(d.seo_description);
  };

  // Méthode 2 : générer depuis la composition (produits existants).
  const runAi = () => {
    if (selected.length === 0) {
      setAiError("Ajoutez au moins un produit au coffret avant de générer.");
      return;
    }
    setAiError(null);
    setAiDone(false);
    const items = selected.map((s) => ({
      name: productById.get(s.product_id)?.name ?? "",
      quantity: s.quantity,
    }));
    startAi(async () => {
      const res = await generatePackInfo(items);
      if (res.error || !res.data) {
        setAiError(res.error ?? "Génération impossible.");
        return;
      }
      applyText(res.data);
      // Suggestion de prix depuis la valeur cumulée : ancien prix = somme,
      // prix du coffret = −15 % (remise cadeau), arrondis proprement.
      if (componentsTotal > 0) {
        setOldPrice(String(roundNice(componentsTotal)));
        setCurrentPrice(String(roundNice(componentsTotal * 0.85)));
      }
      setAiDone(true);
    });
  };

  // Méthode 1 : générer depuis la PHOTO du coffret (analyse Vision, comme un produit).
  const runPhotoAi = (url: string) => {
    if (!url) return;
    setAiError(null);
    setAiDone(false);
    startAi(async () => {
      const res = await generateProductInfo(
        url,
        categories.map((c) => ({ id: c.id, name: c.name, parent_id: c.parent_id })),
      );
      if (res.error || !res.data) {
        setAiError(res.error ?? "Analyse impossible.");
        return;
      }
      applyText(res.data);
      if (res.data.category_id && categories.some((c) => c.id === res.data!.category_id)) {
        setCategoryId(res.data.category_id);
      }
      if (res.data.current_price != null) setCurrentPrice(String(res.data.current_price));
      if (res.data.old_price != null) setOldPrice(String(res.data.old_price));
      setAiDone(true);
    });
  };

  // Ajout/suppression de photo → lance l'analyse Vision sur la 1re image.
  const handleImagesChange = (urls: string[]) => {
    const first = urls[0] ?? "";
    if (first && first !== imageUrl) runPhotoAi(first);
    setImageUrl(first);
  };

  const action = (formData: FormData) => {
    setError(null);
    // La composition est optionnelle : un pack peut être un produit à part
    // entière (créé depuis une photo) OU un ensemble de produits existants.
    formData.set("pack_items", JSON.stringify(selected));
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdatePack(pack!.id, formData)
        : await adminCreatePack(formData);
      if (res?.error) setError(res.error);
      else {
        router.push("/admin/coffrets");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A2A52] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0A2A52]">{isEdit ? "Modifier le coffret" : "Nouveau coffret cadeau"}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{isEdit ? pack!.name : "Un coffret regroupe plusieurs produits vendus ensemble"}</p>
        </div>
      </div>

      <form action={action} className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informations générales">
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Nom du coffret<span className="text-red-500 ml-0.5">*</span></label>
              <input name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Coffret Beauté Éclat" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Description courte</label>
              <input name="short_description" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Une ligne d'accroche" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Description complète</label>
              <textarea name="description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Ce que contient le coffret, à qui l'offrir…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
            </div>
          </Card>

          {/* Composition du pack (optionnelle) */}
          <Card title="Produits du coffret (optionnel)">
            <p className="text-xs text-text-secondary -mt-1">
              Laissez vide si le coffret est un produit à part entière (créé depuis une photo). Sinon,
              sélectionnez des produits existants pour vendre l'ensemble avec une remise.
            </p>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Rechercher un produit à ajouter…"
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-20 mt-1 left-0 right-0 bg-white rounded-lg border border-gray-100 shadow-lg py-1 max-h-72 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                        {p.main_image_url
                          ? <Image src={p.main_image_url} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                          : <Package size={15} className="text-gray-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#0A2A52] truncate">{p.name}</p>
                        <p className="text-xs text-text-secondary">{formatPrice(p.current_price)}</p>
                      </div>
                      <Plus size={15} className="text-green shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected.length === 0 ? (
              <div className="text-center py-8 text-sm text-text-secondary border border-dashed border-gray-200 rounded-lg">
                Aucun produit dans ce coffret pour l'instant.
              </div>
            ) : (
              <div className="space-y-2">
                {selected.map((s) => {
                  const p = productById.get(s.product_id);
                  return (
                    <div key={s.product_id} className="flex items-center gap-3 border border-gray-100 rounded-lg p-2.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                        {p?.main_image_url
                          ? <Image src={p.main_image_url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                          : <Package size={16} className="text-gray-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#0A2A52] truncate">{p?.name ?? "Produit introuvable"}</p>
                        {p && <p className="text-xs text-text-secondary">{formatPrice(p.current_price)}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => setQty(s.product_id, s.quantity - 1)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Diminuer">
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-[#0A2A52]">{s.quantity}</span>
                        <button type="button" onClick={() => setQty(s.product_id, s.quantity + 1)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Augmenter">
                          <Plus size={13} />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeProduct(s.product_id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0" aria-label="Retirer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-1 text-sm">
                  <span className="text-text-secondary">Valeur cumulée des produits</span>
                  <span className="font-semibold text-[#0A2A52]">{formatPrice(componentsTotal)}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Bandeau IA — deux façons de générer les détails */}
          <div className="rounded-lg border border-green/30 bg-green-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center shrink-0">
                {aiPending ? <Loader2 size={18} className="text-green animate-spin" /> : <Sparkles size={18} className="text-green" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A2A52]">{"Remplissage automatique par l'IA"}</p>
                <p className="text-xs text-text-secondary">
                  {aiPending ? "Génération en cours…"
                    : aiError ? <span className="text-red-600">{aiError}</span>
                    : aiDone ? "Détails générés — vérifiez et ajustez."
                    : "Deux options : ajoutez une photo du coffret (analyse auto), ou composez avec des produits existants puis générez."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pl-12">
              <button
                type="button"
                onClick={() => runPhotoAi(imageUrl)}
                disabled={aiPending || !imageUrl}
                className="flex items-center gap-1.5 text-xs font-semibold bg-green text-[#0A2A52] px-3 py-2 rounded-lg btn-sweep hover:bg-[#237A34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!imageUrl ? "Ajoutez d'abord une photo du coffret" : "Analyser la photo"}
              >
                <Sparkles size={14} /> Analyser la photo
              </button>
              <button
                type="button"
                onClick={runAi}
                disabled={aiPending || selected.length === 0}
                className="flex items-center gap-1.5 text-xs font-semibold border border-green text-[#0A2A52] px-3 py-2 rounded-lg hover:bg-green/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={selected.length === 0 ? "Ajoutez d'abord des produits" : "Générer depuis les produits"}
              >
                <Package size={14} /> Depuis les produits
              </button>
            </div>
          </div>

          <Card title="Prix & stock">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Prix du coffret (DH)<span className="text-red-500 ml-0.5">*</span></label>
                <input name="current_price" type="number" min={0} value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} required placeholder="450" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Ancien prix (DH)</label>
                <input name="old_price" type="number" min={0} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="600" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
              </div>
              <Field label="Stock" name="stock_quantity" type="number" defaultValue={pack ? String(pack.stock_quantity) : "100"} placeholder="10" />
            </div>
            <Field label="SKU (référence)" name="sku" defaultValue={pack?.sku ?? ""} placeholder="PACK-ECLAT" />
          </Card>

          <Card title="Référencement (SEO)">
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Titre SEO</label>
              <input name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Coffret Beauté Éclat à Casablanca | RYTA" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Description SEO</label>
              <textarea name="seo_description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} placeholder="Description pour les moteurs de recherche…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
            </div>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Card title="Photos du coffret">
            <MultiImageUpload
              name="images"
              bucket="products"
              label="Photos (5 max)"
              defaultValues={initialImages}
              max={5}
              onChange={handleImagesChange}
              studio
            />
            <p className="text-[11px] text-text-secondary">{"La 1re photo est l'image principale. L'IA analyse la photo dès son ajout."}</p>
          </Card>

          <Card title="Organisation">
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Catégorie (optionnel)</label>
              <select name="category_id" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">— Aucune —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Statut</label>
              <select name="status" defaultValue={pack?.status ?? "active"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </Card>

          <Card title="Mise en avant">
            <Checkbox name="is_featured" label="Coffret vedette" defaultChecked={pack?.is_featured} />
            <Checkbox name="is_new" label="Nouveauté" defaultChecked={pack?.is_new} />
            <Checkbox name="is_promo" label="En promotion" defaultChecked={pack?.is_promo} />
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={pending} className="flex items-center justify-center gap-2 bg-green btn-sweep hover:bg-[#237A34] disabled:opacity-60 text-[#0A2A52] text-sm font-semibold px-5 py-3 rounded-lg transition-colors">
              <Gift size={16} /> {pending ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le coffret"}
            </button>
            <button type="button" onClick={() => router.push("/admin/coffrets")} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-[#0A2A52] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required, defaultValue }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} min={type === "number" ? 0 : undefined} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="w-4 h-4 rounded border-gray-300 text-green focus:ring-green accent-green" />
      <span className="text-sm text-[#0A2A52]">{label}</span>
    </label>
  );
}
