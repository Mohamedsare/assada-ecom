"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bouton retour flottant (icône). Revient à la page précédente,
 * ou à l'accueil s'il n'y a pas d'historique de navigation.
 */
export default function BackButton({
  fallback = "/",
  label = "Retour",
  className,
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 pl-2.5 pr-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm backdrop-blur transition-all",
        "hover:border-green/40 hover:shadow-md hover:-translate-x-0.5 active:scale-95",
        className
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F5F9] text-[#0F172A] transition-colors group-hover:bg-green group-hover:text-white">
        <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
      </span>
      {label}
    </button>
  );
}
