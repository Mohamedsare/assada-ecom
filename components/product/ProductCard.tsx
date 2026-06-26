"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { formatPrice, calculateDiscount, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart";
import { openCartDrawer, addToast } from "@/lib/ui-actions";

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const existing = items.find((i) => i.product.id === product.id);
    _addItem(product);
    openCartDrawer();
    addToast(
      existing
        ? { type: "info",    title: "Quantité mise à jour", message: product.name }
        : { type: "success", title: "Ajouté au panier",     message: product.name }
    );
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col",
      className
    )}>
      {/* Image */}
      <Link href={`/produit/${product.slug}`} className="relative block aspect-square bg-white overflow-hidden p-3">
        {product.main_image_url ? (
          <Image
            src={product.main_image_url}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">📦</div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.is_new && (
            <span className="bg-green text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Nouveau</span>
          )}
          {product.is_promo && discount > 0 && (
            <span className="bg-green text-white text-[10px] font-bold px-2.5 py-1 rounded-md">-{discount}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
          aria-label="Ajouter aux favoris"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={15} />
        </button>
      </Link>

      {/* Content */}
      <div className="px-4 pb-4 pt-1 flex flex-col flex-1">
        <Link href={`/produit/${product.slug}`}>
          <h3 className="text-sm font-bold text-[#0F172A] mb-0.5 line-clamp-1 hover:text-green transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-text-secondary mb-3">
            {product.category.name
              .replace("Chaussures ", "")
              .replace("Vêtements ", "")
              .replace("Accessoires ", "")}
          </p>
        )}

        {/* Price + cart */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-[#0F172A] leading-none">
              {formatPrice(product.current_price)}
            </p>
            {product.old_price && (
              <p className="text-[11px] text-gray-400 line-through mt-1">
                {formatPrice(product.old_price)}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            aria-label="Ajouter au panier"
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              product.stock_quantity > 0
                ? "bg-night text-white hover:bg-green"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            )}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
