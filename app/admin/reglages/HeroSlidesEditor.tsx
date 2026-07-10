"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Video, Loader2, X, ArrowLeft, ArrowRight, Save, Sparkles } from "lucide-react";
import { uploadImage, adminUpdateHeroSlides, generateBannerTitle } from "@/lib/supabase/actions";
import type { HeroSlide } from "@/lib/constants";

/**
 * Extrait une image (data URL JPEG) d'une vidéo, côté client, pour l'analyse IA.
 * Nécessite que le stockage renvoie les en-têtes CORS (sinon le canvas est « taint » → null).
 */
async function captureVideoFrame(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    let done = false;
    const finish = (val: string | null) => { if (!done) { done = true; resolve(val); } };
    const grab = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) return finish(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.82));
      } catch { finish(null); }
    };
    video.onloadeddata = () => {
      try { video.currentTime = Math.min(1, (video.duration || 2) / 2); } catch { grab(); }
    };
    video.onseeked = grab;
    video.onerror = () => finish(null);
    setTimeout(() => finish(null), 8000);
  });
}

/**
 * Éditeur du slider d'accueil : liste ordonnée de slides (image ou vidéo).
 * L'admin peut ajouter autant de slides qu'il veut, en supprimer, les réordonner,
 * puis enregistrer. Chaque ajout uploade le fichier dans le bucket `products`.
 */
export default function HeroSlidesEditor({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [aiIndex, setAiIndex] = useState<number | null>(null);
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

  const updateSlide = (i: number, patch: Partial<HeroSlide>) =>
    setSlides((s) => s.map((sl, idx) => (idx === i ? { ...sl, ...patch } : sl)));

  // Propose un titre via l'IA d'après le visuel (image directe, frame pour une vidéo).
  const suggestTitle = async (i: number) => {
    const slide = slides[i];
    if (!slide) return;
    setError(null);
    setAiIndex(i);
    try {
      let src = slide.url;
      if (slide.type === "video") {
        const frame = await captureVideoFrame(slide.url);
        if (!frame) {
          setError("Impossible d'extraire une image de cette vidéo (CORS du stockage). Saisissez le titre manuellement.");
          return;
        }
        src = frame;
      }
      const res = await generateBannerTitle(src);
      if (res.title) updateSlide(i, { title: res.title });
      else setError(res.error ?? "Échec de la suggestion IA.");
    } catch {
      setError("Une erreur est survenue pendant la suggestion IA.");
    } finally {
      setAiIndex(null);
    }
  };

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
        Pour chaque bannière : un <strong>grand titre</strong> (laissez vide pour une bannière épurée) et le
        <strong> lien du bouton « Découvrir »</strong>. Les vidéos défilent en fond, sans son.
        Formats conseillés : image ~1600×600 px, vidéo MP4 légère (&lt; 20 Mo).
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
              <div className="space-y-2 px-2 py-2 bg-white">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={slide.title ?? ""}
                    onChange={(e) => updateSlide(i, { title: e.target.value })}
                    placeholder="Grand titre (optionnel)"
                    className="flex-1 min-w-0 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#B8925A] focus:ring-2 focus:ring-[#B8925A]/15"
                  />
                  <button
                    type="button"
                    onClick={() => suggestTitle(i)}
                    disabled={aiIndex !== null}
                    title="Proposer un titre avec l'IA (analyse le visuel)"
                    className="shrink-0 inline-flex items-center gap-1 rounded-md border border-[#B8925A]/50 text-[#8A6D3F] px-2 text-xs font-medium hover:bg-[#B8925A]/10 disabled:opacity-50"
                  >
                    {aiIndex === i ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    IA
                  </button>
                </div>
                <input
                  type="text"
                  value={slide.link ?? ""}
                  onChange={(e) => updateSlide(i, { link: e.target.value })}
                  placeholder="Lien du bouton (ex : /promotions)"
                  className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#B8925A] focus:ring-2 focus:ring-[#B8925A]/15"
                />
                <div className="flex items-center justify-between pt-0.5">
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
          className="inline-flex items-center gap-2 bg-green btn-sweep hover:bg-[#9E7A45] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors ml-auto"
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
