"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { adminCreateProduct, adminUpdateProduct, generateProductInfo } from "@/lib/supabase/actions";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import VideoUploadField from "@/components/admin/VideoUploadField";
import type { Product, Category, Brand } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Actif" },
  { value: "draft", label: "Brouillon" },
  { value: "out_of_stock", label: "Rupture" },
  { value: "hidden", label: "Masqué" },
];

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product | null;
  categories: Category[];
  brands: Brand[];
}) {
  const isEdit = !!product;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Champs remplis automatiquement par l'IA — donc contrôlés.
  const [name, setName] = useState(product?.name ?? "");
  const [shortDesc, setShortDesc] = useState(product?.short_description ?? "");
  const [desc, setDesc] = useState(product?.description ?? "");
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(product?.seo_description ?? "");

  // Photos existantes (édition) triées par ordre
  const initialImages = (product?.images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.image_url);
  if (!initialImages.length && product?.main_image_url) initialImages.push(product.main_image_url);

  // État de l'analyse IA (basée sur la 1re photo)
  const [imageUrl, setImageUrl] = useState(initialImages[0] ?? "");
  const [aiPending, startAi] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDone, setAiDone] = useState(false);

  const handleImagesChange = (urls: string[]) => {
    const first = urls[0] ?? "";
    if (first && first !== imageUrl) runAi(first);
    setImageUrl(first);
  };

  const runAi = (url: string) => {
    if (!url) return;
    setAiError(null);
    setAiDone(false);
    startAi(async () => {
      const res = await generateProductInfo(url);
      if (res.error || !res.data) {
        setAiError(res.error ?? "Analyse impossible.");
      } else {
        setName(res.data.name);
        setShortDesc(res.data.short_description);
        setDesc(res.data.description);
        setSeoTitle(res.data.seo_title);
        setSeoDesc(res.data.seo_description);
        setAiDone(true);
      }
    });
  };

  const action = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await adminUpdateProduct(product!.id, formData)
        : await adminCreateProduct(formData);
      if (res?.error) setError(res.error);
      else {
        router.push("/admin/produits");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0F172A] transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{isEdit ? "Modifier le produit" : "Nouveau produit"}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{isEdit ? product!.name : "Renseignez les informations du produit"}</p>
        </div>
      </div>

      <form action={action} className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bandeau IA */}
          <div className="rounded-lg border border-green/30 bg-green-50/50 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green/10 flex items-center justify-center shrink-0">
              {aiPending ? <Loader2 size={18} className="text-green animate-spin" /> : <Sparkles size={18} className="text-green" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A]">{"Remplissage automatique par l'IA"}</p>
              <p className="text-xs text-text-secondary">
                {aiPending ? "Analyse de la photo en cours…"
                  : aiError ? <span className="text-red-600">{aiError}</span>
                  : aiDone ? "Champs générés — vérifiez et ajustez si besoin."
                  : "Ajoutez une photo : nom, descriptions et SEO seront générés automatiquement."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => runAi(imageUrl)}
              disabled={aiPending || !imageUrl}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-green text-white px-3 py-2 rounded-lg hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={!imageUrl ? "Ajoutez d'abord une photo" : "Analyser la photo"}
            >
              <Sparkles size={14} /> {aiPending ? "…" : aiDone ? "Régénérer" : "Analyser"}
            </button>
          </div>

          <Card title="Informations générales">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Nom du produit<span className="text-red-500 ml-0.5">*</span></label>
              <input name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nike Air Max 270" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description courte</label>
              <input name="short_description" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Une ligne d'accroche" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description complète</label>
              <textarea name="description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} placeholder="Description détaillée du produit…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
            </div>
          </Card>

          <Card title="Prix & stock">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Prix actuel (FCFA)" name="current_price" type="number" defaultValue={product ? String(product.current_price) : ""} placeholder="65000" required />
              <Field label="Ancien prix (FCFA)" name="old_price" type="number" defaultValue={product?.old_price ? String(product.old_price) : ""} placeholder="80000" />
              <Field label="Stock" name="stock_quantity" type="number" defaultValue={product ? String(product.stock_quantity) : "0"} placeholder="10" />
            </div>
            <Field label="SKU (référence)" name="sku" defaultValue={product?.sku ?? ""} placeholder="NK-AM270-42" />
          </Card>

          <Card title="Référencement (SEO)">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Titre SEO</label>
              <input name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Nike Air Max 270 au Gabon | Odm's Shopping" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Description SEO</label>
              <textarea name="seo_description" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} placeholder="Description pour les moteurs de recherche…" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none" />
            </div>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Card title="Photos & vidéo">
            <MultiImageUpload
              name="images"
              bucket="products"
              label="Photos (5 max)"
              defaultValues={initialImages}
              max={5}
              onChange={handleImagesChange}
            />
            <p className="text-[11px] text-text-secondary">{"La 1re photo est l'image principale. L'IA génère la fiche dès son ajout."}</p>
            <div className="pt-1">
              <VideoUploadField
                name="video_url"
                bucket="products"
                label="Vidéo (1 max)"
                defaultValue={product?.video_url}
              />
            </div>
          </Card>

          <Card title="Organisation">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Catégorie</label>
              <select name="category_id" defaultValue={product?.category_id ?? ""} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">— Aucune —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Marque</label>
              <select name="brand_id" defaultValue={product?.brand_id ?? ""} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                <option value="">— Aucune —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Statut</label>
              <select name="status" defaultValue={product?.status ?? "active"} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </Card>

          <Card title="Mise en avant">
            <Checkbox name="is_featured" label="Produit vedette" defaultChecked={product?.is_featured} />
            <Checkbox name="is_new" label="Nouveauté" defaultChecked={product?.is_new} />
            <Checkbox name="is_promo" label="En promotion" defaultChecked={product?.is_promo} />
          </Card>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={pending} className="bg-green hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-colors">
              {pending ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le produit"}
            </button>
            <button type="button" onClick={() => router.push("/admin/produits")} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
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
      <h2 className="font-semibold text-[#0F172A] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required, defaultValue }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} min={type === "number" ? 0 : undefined} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
    </div>
  );
}

function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" name={name} value="true" defaultChecked={defaultChecked} className="w-4 h-4 rounded border-gray-300 text-green focus:ring-green accent-green" />
      <span className="text-sm text-[#0F172A]">{label}</span>
    </label>
  );
}
