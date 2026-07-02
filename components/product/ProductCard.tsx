"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Play, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart";
import { openCartDrawer, openQuickView, addToast } from "@/lib/ui-actions";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const items    = useCartStore((s) => s.items);
  const _addItem = useCartStore((s) => s.addItem);

  const discount = product.old_price
    ? calculateDiscount(product.old_price, product.current_price)
    : 0;

  const rating = product.rating ?? 0;
  const reviews = product.review_count ?? 0;

  // Galerie d'images de la carte (plusieurs photos → carrousel)
  const gallery = (
    product.images?.length
      ? [...product.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url)
      : product.main_image_url
      ? [product.main_image_url]
      : []
  );
  const [imgIndex, setImgIndex] = useState(0);
  const hasCarousel = gallery.length > 1;

  const step = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIndex((i) => (i + dir + gallery.length) % gallery.length);
  };

  const hasVariants = (product.variants?.length ?? 0) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Produit à variantes → on ouvre l'aperçu pour choisir couleur/taille
    // avant d'ajouter (pas d'ajout « à l'aveugle »).
    if (hasVariants) {
      openQuickView(product);
      return;
    }
    const existing = items.find((i) => i.product.id === product.id);
    _addItem(product);
    openCartDrawer();
    addToast(
      existing
        ? { type: "info",    title: "Quantité mise à jour", message: product.name }
        : { type: "success", title: "Ajouté au panier",     message: product.name }
    );
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-white transition-all duration-200",
        "hover:z-10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5",
        className
      )}
    >
      {/* Image */}
      <Link
        href={`/produit/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-[#f5f5f5]"
      >
        {gallery.length > 0 ? (
          <Image
            src={gallery[imgIndex]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl text-gray-200">📦</div>
        )}

        {/* Carousel arrows (apparaissent au survol) */}
        {hasCarousel && (
          <>
            <button
              onClick={step(-1)}
              aria-label="Image précédente"
              className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#020B27] opacity-0 shadow transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={step(1)}
              aria-label="Image suivante"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#020B27] opacity-0 shadow transition-opacity duration-200 hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {gallery.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === imgIndex ? "w-3 bg-[#0F172A]" : "w-1.5 bg-white/80 shadow"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Indicateur vidéo (masqué au survol pour laisser place à « Aperçu ») */}
        {product.video_url && (
          <span className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-0">
            <Play size={12} className="ml-0.5 fill-white" />
          </span>
        )}

        {/* Aperçu — fonctionnel, ouvre la modale */}
        <button
          onClick={handleQuickView}
          aria-label="Aperçu rapide"
          className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#020B27] opacity-0 shadow-sm transition-all duration-200 hover:bg-white group-hover:opacity-100"
        >
          <Eye size={13} />
          Aperçu
        </button>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col px-1.5 pb-2 pt-1.5">
        {/* Badges */}
        {(product.is_promo || product.is_new) && (
          <div className="mb-1 flex flex-wrap items-center gap-1">
            {product.is_promo && (
              <span className="inline-flex items-center rounded-sm bg-green/10 px-1.5 py-0.5 text-[10px] font-semibold text-green">
                Économies
              </span>
            )}
            {product.is_new && (
              <span className="inline-flex items-center rounded-sm bg-green/10 px-1.5 py-0.5 text-[10px] font-semibold text-green">
                Nouveau
              </span>
            )}
          </div>
        )}

        {/* Name */}
        <Link href={`/produit/${product.slug}`}>
          <h3 className="line-clamp-1 text-[13px] leading-tight text-[#475569] hover:text-[#020B27]">
            {product.name}
          </h3>
        </Link>

        {/* Price + cart */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <p className="whitespace-nowrap text-[17px] font-extrabold leading-none text-green">
              {formatPrice(product.current_price)}
            </p>
            {product.old_price && (
              <p className="text-[11px] text-gray-400 line-through">
                {formatPrice(product.old_price)}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            aria-label={hasVariants ? "Choisir les options" : "Ajouter au panier"}
            title={hasVariants ? "Choisir couleur / taille" : "Ajouter au panier"}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
              product.stock_quantity > 0
                ? "border-gray-300 text-[#020B27] hover:border-[#0F172A] hover:bg-[#15803D] hover:text-white"
                : "cursor-not-allowed border-gray-200 text-gray-300"
            )}
          >
            <ShoppingCart size={15} />
          </button>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <p className="mt-1 text-[11px] font-semibold text-red-500">-{discount}%</p>
        )}

        {/* Rating + reviews */}
        {(rating > 0 || reviews > 0) && (
          <div className="mt-1 flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={cn(
                    i < Math.round(rating)
                      ? "fill-[#0F172A] text-[#020B27]"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              ))}
            </div>
            {reviews > 0 && (
              <span className="text-[11px] text-text-secondary">{reviews}</span>
            )}
          </div>
        )}

        {/* Seller badge */}
        {product.is_featured && (
          <span className="mt-1.5 inline-flex w-fit items-center rounded-sm bg-[#8B5CF6]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#8B5CF6]">
            Vendeur vedette
          </span>
        )}
      </div>
    </div>
  );
}
