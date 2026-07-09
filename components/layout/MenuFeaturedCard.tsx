"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePageImage } from "@/stores/config";
import type { MenuFeatured } from "@/lib/constants";

/**
 * Carte visuelle d'un méga-menu (desktop) ou d'un accordéon (mobile).
 * L'image est éditable dans l'admin « Gestion des pages » → « Images liens » (clé `imageKey`),
 * avec repli sur `fallback`. `className` règle la taille selon le contexte.
 */
export default function MenuFeaturedCard({
  item,
  onClick,
  className,
}: {
  item: MenuFeatured;
  onClick: () => void;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  const dyn = usePageImage(item.imageKey);
  const src = err ? item.fallback : dyn;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn("group relative overflow-hidden rounded-2xl bg-gray-100", className ?? "h-56 w-44 shrink-0")}
    >
      <Image
        src={src}
        alt={item.caption}
        fill
        sizes="200px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => setErr(true)}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">{item.caption}</span>
    </Link>
  );
}
