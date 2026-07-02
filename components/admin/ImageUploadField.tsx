"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/supabase/actions";

/**
 * Champ d'upload d'image réutilisable.
 * La valeur (URL publique) est soumise avec le formulaire via un input caché `name`.
 */
export default function ImageUploadField({
  name,
  bucket,
  label,
  defaultValue,
  className,
  onChange,
}: {
  name: string;
  bucket: string;
  label: string;
  defaultValue?: string;
  className?: string;
  /** Appelé après un upload réussi ou un retrait, avec la nouvelle URL ("" si retirée). */
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const setValue = (next: string) => {
    setUrl(next);
    onChange?.(next);
  };

  const handleFile = (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const res = await uploadImage(bucket, formData);
      if (res.error || !res.url) setError(res.error ?? "Échec de l'upload");
      else setValue(res.url);
    });
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#020B27] mb-1.5">{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative w-28 h-28 rounded-lg border border-gray-200 overflow-hidden group">
          <Image src={url} alt="Aperçu" fill sizes="112px" className="object-cover" />
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
            title="Retirer l'image"
          >
            <X size={14} />
          </button>
          {pending && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-green" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-200 hover:border-green flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-green transition-colors disabled:opacity-60"
        >
          {pending ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
          <span className="text-[11px] font-medium">{pending ? "Envoi…" : "Choisir"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
