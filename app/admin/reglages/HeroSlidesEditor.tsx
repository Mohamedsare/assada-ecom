"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Video, Loader2, X, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { uploadImage, adminUpdateHeroSlides } from "@/lib/supabase/actions";
import type { HeroSlide } from "@/lib/constants";

/**
 * Éditeur du slider d'accueil : liste ordonnée de slides (image ou vidéo).
 * L'admin peut ajouter autant de slides qu'il veut, en supprimer, les réordonner,
 * puis enregistrer. Chaque ajout uploade le fichier dans le bucket `products`.
 */
export default function HeroSlidesEditor({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, startSaving] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Limite alignée sur next.config.ts (serverActions + proxyClientMaxBodySize = 20 Mo).
  const MAX_BYTES = 20 * 1024 * 1024;

  const addFile = (file: File, type: "image" | "video") => {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(
        `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 20 Mo — compressez la ${type === "video" ? "vidéo" : "image"}.`,
      );
      return;
    }
    setUploading(type);
    const formData = new FormData();
    formData.append("file", file);
    uploadImage("products", formData)
      .then((res) => {
        if (res.error || !res.url) setError(res.error ?? "Échec de l'upload.");
        else setSlides((s) => [...s, { type, url: res.url! }]);
      })
      .catch(() => setError("Une erreur est survenue pendant l'upload."))
      .finally(() => setUploading(null));
  };

  const removeAt = (i: number) => setSlides((s) => s.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    setSlides((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const copy = [...s];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  const save = () => {
    setError(null);
    startSaving(async () => {
      const res = await adminUpdateHeroSlides(slides);
      if (res?.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
      else setError(res?.error ?? "Échec de l'enregistrement.");
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-[#020B27] mb-1">Accueil — bannières du slider</h2>
      <p className="text-text-secondary text-xs mb-4">
        Ajoutez autant de bannières que vous voulez (images ou vidéos), réordonnez-les et supprimez-les.
        Les vidéos défilent en fond, sans son. Formats conseillés : image ~1600×600 px, vidéo MP4 légère (&lt; 10 Mo).
      </p>

      {slides.length === 0 ? (
        <div className="text-sm text-text-secondary bg-gray-50 border border-dashed border-gray-200 rounded-lg px-4 py-6 text-center mb-4">
          Aucune bannière. Ajoutez-en une ci-dessous — sinon les bannières par défaut du site seront affichées.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {slides.map((slide, i) => (
            <div key={`${slide.url}-${i}`} className="relative rounded-lg border border-gray-200 overflow-hidden group">
              <div className="relative w-full aspect-video bg-gray-100">
                {slide.type === "video" ? (
                  <video src={slide.url} muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <Image src={slide.url} alt={`Bannière ${i + 1}`} fill sizes="320px" className="object-cover" />
                )}
                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {slide.type === "video" ? <><Video size={11} /> Vidéo</> : <><ImagePlus size={11} /> Image</>}
                  <span className="opacity-70">#{i + 1}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                  title="Supprimer cette bannière"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between px-2 py-1.5 bg-white">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1 rounded text-gray-500 hover:text-[#020B27] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Déplacer à gauche"
                >
                  <ArrowLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  className="p-1 rounded text-gray-500 hover:text-[#020B27] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Déplacer à droite"
                >
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading !== null}
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-green text-[#020B27] text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {uploading === "image" ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          Ajouter une image
        </button>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading !== null}
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-green text-[#020B27] text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {uploading === "video" ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
          Ajouter une vidéo
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving || uploading !== null}
          className="inline-flex items-center gap-2 bg-green hover:bg-[#9E7A45] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors ml-auto"
        >
          <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer le slider"}
        </button>
      </div>

      {saved && <p className="text-green text-sm font-medium mt-2">✓ Slider enregistré</p>}
      {error && <p className="text-red-600 text-sm font-medium mt-2">{error}</p>}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) addFile(f, "image"); e.target.value = ""; }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) addFile(f, "video"); e.target.value = ""; }}
      />
    </div>
  );
}
