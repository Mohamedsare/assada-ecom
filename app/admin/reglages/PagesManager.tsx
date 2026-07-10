"use client";

import { useState } from "react";
import { LayoutTemplate, Save, Info } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import HeroSlidesEditor from "./HeroSlidesEditor";
import { adminUpdatePageImages } from "@/lib/supabase/actions";
import { PAGE_IMAGE_GROUPS, type HeroSlide } from "@/lib/constants";

export default function PagesManager({ images, heroSlides }: { images: Record<string, string>; heroSlides: HeroSlide[] }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      const res = await adminUpdatePageImages(formData);
      if (res?.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
      else setError(res?.error ?? "Échec de l'enregistrement.");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LayoutTemplate size={20} className="text-green" />
        <h1 className="text-xl font-bold text-[#020B27]">Gestion des pages</h1>
      </div>
      <p className="text-text-secondary text-sm mb-5">
        Personnalisez les images du site sans toucher au code. Vos changements sont visibles immédiatement.
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2 mb-5 max-w-3xl">
        <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Formats conseillés : bannières larges et de bonne qualité (JPG/PNG, ~1600×600 px). Laissez un champ
          vide pour revenir à l&apos;image par défaut.
        </p>
      </div>

      {/* Slider d'accueil : liste dynamique (images/vidéos), avec sa propre sauvegarde. */}
      <div className="max-w-3xl mb-5">
        <HeroSlidesEditor initialSlides={heroSlides} />
      </div>

      <form action={handleAction} className="space-y-5 max-w-3xl">
        {PAGE_IMAGE_GROUPS.map((group) => (
          <div key={group.group} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-[#020B27] mb-4">{group.group}</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {group.items.map((item) => (
                <ImageUploadField
                  key={item.key}
                  name={item.key}
                  bucket="products"
                  label={item.label}
                  defaultValue={images[item.key]}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-green btn-sweep hover:bg-[#9E7A45] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
          {saved && <span className="text-green text-sm font-medium">✓ Modifications enregistrées</span>}
          {error && <span className="text-red-600 text-sm font-medium">{error}</span>}
        </div>
      </form>
    </div>
  );
}
