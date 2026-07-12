"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { uploadImage } from "@/lib/supabase/actions";

/**
 * Uploader d'avatar rond, premium :
 * - photo ou initiales en fallback ;
 * - overlay caméra au survol + bouton badge ;
 * - état de chargement ;
 * - retrait de la photo.
 * La valeur (URL publique) est soumise avec le formulaire via un input caché `name`.
 */
export default function AvatarUpload({
  name,
  bucket,
  fallback,
  defaultValue,
}: {
  name: string;
  bucket: string;
  /** Texte de repli (initiales) quand aucune photo. */
  fallback: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 3 * 1024 * 1024; // 3 Mo

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("La photo doit faire 3 Mo maximum.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const res = await uploadImage(bucket, formData);
      if (res.error || !res.url) setError(res.error ?? "Échec de l'upload");
      else setUrl(res.url);
    });
  };

  const initials = fallback.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-5">
      <input type="hidden" name={name} value={url} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="group relative w-24 h-24 rounded-full shrink-0 overflow-hidden ring-4 ring-white shadow-md focus:outline-none focus-visible:ring-green"
        aria-label="Changer la photo de profil"
      >
        {url ? (
          <Image src={url} alt="Photo de profil" fill sizes="96px" className="object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center bg-linear-to-br from-green to-green-light text-[#0A2A52] font-bold text-2xl">
            {initials}
          </span>
        )}

        {/* Overlay au survol */}
        <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
          <Camera size={20} />
          <span className="text-[10px] font-medium">Changer</span>
        </span>

        {/* Chargement */}
        {pending && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-green" />
          </span>
        )}

        {/* Badge caméra */}
        <span className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-green text-[#0A2A52] flex items-center justify-center ring-2 ring-white shadow">
          <Camera size={14} />
        </span>
      </button>

      <div className="min-w-0">
        <p className="text-sm font-medium text-[#0A2A52]">Photo de profil</p>
        <p className="text-xs text-text-secondary mt-0.5">JPG, PNG ou WebP · 3 Mo max.</p>
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="text-xs font-medium text-green hover:underline disabled:opacity-60"
          >
            {url ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {url && (
            <button
              type="button"
              onClick={() => { setUrl(""); setError(null); }}
              disabled={pending}
              className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:underline disabled:opacity-60"
            >
              <Trash2 size={12} /> Retirer
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      </div>

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
    </div>
  );
}
