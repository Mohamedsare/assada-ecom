"use client";

import { useRef, useState, useTransition } from "react";
import { Film, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/supabase/actions";

/**
 * Upload d'une seule vidéo. L'URL est soumise via un input caché `name`.
 * Réutilise l'action uploadImage (gère n'importe quel type de fichier).
 */
export default function VideoUploadField({
  name,
  bucket,
  label,
  defaultValue,
}: {
  name: string;
  bucket: string;
  label: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo (aligné sur file_size_limit du bucket)

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError(`Vidéo trop lourde (${(file.size / 1024 / 1024).toFixed(0)} Mo). Maximum 50 Mo.`);
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadImage(bucket, fd);
      if (res.error || !res.url) setError(res.error ?? "Échec de l'upload");
      else setUrl(res.url);
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#020B27] mb-1.5">{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative rounded-lg border border-gray-200 overflow-hidden">
          <video src={url} controls className="w-full max-h-48 bg-black" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
            title="Retirer la vidéo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 hover:border-green flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-green transition-colors disabled:opacity-60"
        >
          {pending ? <Loader2 size={20} className="animate-spin" /> : <Film size={20} />}
          <span className="text-[11px] font-medium">{pending ? "Envoi…" : "Choisir une vidéo"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
