"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X, Sparkles } from "lucide-react";
import { uploadImage, studioProductImage } from "@/lib/supabase/actions";

/**
 * Upload de plusieurs photos (max `max`, 5 par défaut).
 * Chaque URL est soumise au formulaire via des inputs cachés `name` (getAll côté action).
 * La première photo est utilisée comme image principale.
 */
export default function MultiImageUpload({
  name,
  bucket,
  label,
  defaultValues,
  max = 5,
  onChange,
  studio = false,
}: {
  name: string;
  bucket: string;
  label: string;
  defaultValues?: string[];
  max?: number;
  onChange?: (urls: string[]) => void;
  /** Active le bouton « ✨ Studio » (shooting IA) sur chaque photo. */
  studio?: boolean;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValues ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [studioUrl, setStudioUrl] = useState<string | null>(null);
  const [studioPending, startStudio] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (next: string[]) => {
    setUrls(next);
    onChange?.(next);
  };

  const runStudio = (url: string) => {
    setError(null);
    setStudioUrl(url);
    startStudio(async () => {
      const res = await studioProductImage(url);
      if (res.error || !res.url) {
        setError(res.error ?? "Traitement studio impossible.");
      } else {
        update(urls.map((u) => (u === url ? res.url! : u)));
      }
      setStudioUrl(null);
    });
  };

  const MAX_SIZE = 3 * 1024 * 1024; // 3 Mo par photo

  const handleFiles = (files: FileList) => {
    setError(null);
    const room = max - urls.length;
    if (room <= 0) return;
    const selected = Array.from(files).slice(0, room);

    const tooLarge = selected.filter((f) => f.size > MAX_SIZE);
    if (tooLarge.length) {
      setError(`Chaque photo doit faire 3 Mo maximum (${tooLarge.map((f) => f.name).join(", ")}).`);
    }
    const toUpload = selected.filter((f) => f.size <= MAX_SIZE);
    if (!toUpload.length) return;

    startTransition(async () => {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadImage(bucket, fd);
        if (res.error || !res.url) { setError(res.error ?? "Échec de l'upload"); continue; }
        uploaded.push(res.url);
      }
      if (uploaded.length) update([...urls, ...uploaded].slice(0, max));
    });
  };

  const remove = (url: string) => update(urls.filter((u) => u !== url));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-[#020B27]">{label}</label>
        <span className="text-[11px] text-text-secondary">{urls.length}/{max}</span>
      </div>

      {/* Inputs cachés soumis au formulaire */}
      {urls.map((url, i) => <input key={i} type="hidden" name={name} value={url} />)}

      <div className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
            <Image src={url} alt={`Photo ${i + 1}`} fill sizes="120px" className="object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-green text-[#020B27] text-[9px] font-semibold px-1.5 py-0.5 rounded">Principale</span>
            )}
            <button
              type="button"
              onClick={() => remove(url)}
              disabled={studioPending}
              className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors disabled:opacity-50"
              title="Retirer"
            >
              <X size={13} />
            </button>
            {studio && (
              <button
                type="button"
                onClick={() => runStudio(url)}
                disabled={studioPending}
                className="absolute bottom-1 right-1 bg-[#B8925A] hover:bg-[#9E7A45] text-white rounded-full p-1 shadow-md transition-colors disabled:opacity-50"
                title="Shooting studio IA (détourage + fond blanc)"
              >
                <Sparkles size={13} />
              </button>
            )}
            {studioUrl === url && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1 text-white">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-[9px] font-medium">Studio…</span>
              </div>
            )}
          </div>
        ))}

        {urls.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-green flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-green transition-colors disabled:opacity-60"
          >
            {pending ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-[10px] font-medium">{pending ? "Envoi…" : "Ajouter"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
