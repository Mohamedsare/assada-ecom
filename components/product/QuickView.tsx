"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X, ShoppingCart, Heart, Star, Minus, Plus, Play, Truck, ShieldCheck,
  Package, MessageCircle, ChevronLeft, ChevronRight, ArrowRight, Check,
} from "lucide-react";
import { createPortal } from "react-dom";
import { formatPrice, calculateDiscount, getProductOrderWhatsAppUrl, cn } from "@/lib/utils";
import { colorToHex, isLightColor } from "@/lib/colors";
import type { Product, ProductVariant } from "@/types";
import { useUIStore } from "@/stores/ui";
import { useCartStore } from "@/stores/cart";

export default function QuickView() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const product = useUIStore((s) => s.quickViewProduct);
  if (!mounted) return null;

  return createPortal(<QuickViewOverlay product={product} />, document.body);
}

function QuickViewOverlay({ product }: { product: Product | null }) {
  const close = useUIStore((s) => s.closeQuickView);
  const open = !!product;

  // Lock scroll + close on Escape while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [close]);

  return (
    <>
      <div
        onClick={close}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {product && <QuickViewCard key={product.id} product={product} onClose={close} />}
      </div>
    </>
  );
}

function QuickViewCard({ product, onClose }: { product: Product; onClose: () => void }) {
  const cartItems = useCartStore((s) => s.items);
  const _addItem = useCartStore((s) => s.addItem);
  const addToast = useUIStore((s) => s.addToast);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  // Médias = photos + éventuelle vidéo
  const images = product.images?.length
    ? [...product.images].sort((a, b) => a.sort_order - b.sort_order)
    : product.main_image_url
    ? [{ id: "main", product_id: product.id, image_url: product.main_image_url, alt_text: product.name, sort_order: 0 }]
    : [];
  const media = [
    ...images.map((img) => ({ kind: "image" as const, key: img.id, url: img.image_url, alt: img.alt_text ?? product.name })),
    ...(product.video_url ? [{ kind: "video" as const, key: "video", url: product.video_url, alt: product.name }] : []),
  ];

  const [active, setActive] = useState(0);
  const activeMedia = media[active];
  const goPrev = () => setActive((i) => (i - 1 + media.length) % media.length);
  const goNext = () => setActive((i) => (i + 1) % media.length);

  const variants = product.variants ?? [];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const matchingVariant: ProductVariant | undefined = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );
  const effectivePrice = product.current_price + (matchingVariant?.price_adjustment ?? 0);
  const discount = product.old_price ? calculateDiscount(product.old_price, product.current_price) : 0;
  const inStock = matchingVariant ? matchingVariant.stock_quantity > 0 : product.stock_quantity > 0;
  const stockCount = matchingVariant?.stock_quantity ?? product.stock_quantity;

  const sizesForColor = selectedColor
    ? variants.filter((v) => v.color === selectedColor).map((v) => v.size!)
    : sizes;
  const colorsForSize = selectedSize
    ? variants.filter((v) => v.size === selectedSize).map((v) => v.color!)
    : colors;

  const rating = product.rating ?? 0;
  const reviews = product.review_count ?? 0;

  const handleAddToCart = () => {
    const existing = cartItems.find(
      (i) => i.product.id === product.id && i.variant?.id === matchingVariant?.id
    );
    _addItem(product, matchingVariant, quantity);
    onClose();
    openCartDrawer();
    addToast(
      existing
        ? { type: "info", title: "Quantité mise à jour", message: product.name }
        : { type: "success", title: "Ajouté au panier", message: product.name }
    );
  };

  const whatsappMsg = getProductOrderWhatsAppUrl({
    name: product.name,
    brand: product.brand?.name,
    color: selectedColor,
    size: selectedSize,
    quantity,
    unitPrice: effectivePrice,
    url: typeof window !== "undefined" ? `${window.location.origin}/produit/${product.slug}` : undefined,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu rapide : ${product.name}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] bg-white shadow-2xl overflow-hidden flex flex-col",
        "rounded-t-2xl sm:rounded-2xl animate-quickview"
      )}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Fermer l'aperçu"
        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#020B27] hover:bg-white transition-colors"
      >
        <X size={18} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
        {/* ── Média ── */}
        <div className="bg-[#F8FAFC] md:sticky md:top-0 p-4 md:p-6 flex flex-col gap-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-100">
            {activeMedia?.kind === "video" ? (
              <video src={activeMedia.url} controls className="w-full h-full object-contain bg-black" />
            ) : activeMedia ? (
              <Image src={activeMedia.url} alt={activeMedia.alt} fill className="object-contain p-3" sizes="(max-width: 768px) 100vw, 40vw" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl text-gray-200">📦</div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {product.is_new && (
                <span className="bg-green text-[#020B27] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">Nouveau</span>
              )}
              {discount > 0 && (
                <span className="bg-[#EF4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">-{discount}%</span>
              )}
            </div>

            {/* Carousel arrows */}
            {media.length > 1 && (
              <>
                <button onClick={goPrev} aria-label="Média précédent"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-[#020B27] hover:bg-white transition-colors z-10">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={goNext} aria-label="Média suivant"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-[#020B27] hover:bg-white transition-colors z-10">
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.map((m, i) => (
                <button
                  key={m.key}
                  onClick={() => setActive(i)}
                  aria-label={m.kind === "video" ? "Voir la vidéo" : `Photo ${i + 1}`}
                  className={cn(
                    "relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all bg-white",
                    i === active ? "border-green" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {m.kind === "video" ? (
                    <div className="w-full h-full bg-[#020B27] flex items-center justify-center">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  ) : (
                    <Image src={m.url} alt={m.alt} fill className="object-contain p-1" sizes="56px" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Infos ── */}
        <div className="p-5 md:p-6 flex flex-col gap-4">
          {/* Brand + rating */}
          <div className="flex items-center justify-between gap-2 pr-8">
            {product.brand && (
              <span className="text-xs font-bold text-green uppercase tracking-widest">{product.brand.name}</span>
            )}
            {(rating > 0 || reviews > 0) && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"} />
                  ))}
                </div>
                <span className="text-xs text-[#64748B]">{rating > 0 ? rating.toFixed(1) : ""} ({reviews})</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link href={`/produit/${product.slug}`} onClick={onClose}>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#020B27] leading-tight hover:text-green transition-colors">
              {product.name}
            </h2>
          </Link>

          {/* Price */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl font-extrabold text-green">{formatPrice(effectivePrice)}</span>
            {product.old_price && (
              <span className="text-base text-gray-400 line-through">{formatPrice(product.old_price)}</span>
            )}
            {discount > 0 && (
              <span className="text-xs font-bold text-white bg-[#EF4444] px-2 py-0.5 rounded-md">
                Économisez {formatPrice(product.old_price! - product.current_price)}
              </span>
            )}
          </div>

          {product.short_description && (
            <p className="text-sm text-[#64748B] leading-relaxed line-clamp-3">{product.short_description}</p>
          )}

          <div className="h-px bg-gray-100" />

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#020B27] mb-2">
                Couleur : <span className="font-normal text-[#64748B]">{selectedColor ?? "—"}</span>
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {colors.map((color) => {
                  const available = colorsForSize.includes(color);
                  const hex = colorToHex(color);
                  const isSelected = selectedColor === color;
                  return (
                    <button key={color} onClick={() => available && setSelectedColor(color)} disabled={!available}
                      title={color} aria-label={color} aria-pressed={isSelected}
                      className={cn(
                        "relative w-9 h-9 rounded-full transition-transform hover:scale-110",
                        isSelected ? "ring-2 ring-offset-2 ring-green" : "ring-1 ring-gray-300",
                        !available && "opacity-40 cursor-not-allowed hover:scale-100"
                      )}
                      style={{ background: hex ?? "conic-gradient(#DC6B5C,#facc15,#4ade80,#60a5fa,#c084fc,#DC6B5C)" }}>
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check size={15} className={hex && isLightColor(hex) ? "text-black" : "text-white"} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && sizes[0] !== "Unique" && (
            <div>
              <p className="text-sm font-semibold text-[#020B27] mb-2">
                Taille : <span className="font-normal text-[#64748B]">{selectedSize ?? "—"}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const available = sizesForColor.includes(size);
                  return (
                    <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available}
                      className={cn(
                        "min-w-[3rem] h-10 px-2 rounded-lg border text-sm font-semibold transition-all",
                        selectedSize === size
                          ? "border-green bg-green text-white"
                          : available
                          ? "border-gray-200 text-[#020B27] hover:border-green"
                          : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                      )}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", inStock ? "bg-green" : "bg-[#EF4444]")} />
            <span className={cn("text-sm font-medium", inStock ? "text-green" : "text-[#EF4444]")}>
              {inStock ? `En stock (${stockCount} disponibles)` : "Rupture de stock"}
            </span>
          </div>

          {/* Quantity + add */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuer"
                className="w-10 h-11 flex items-center justify-center text-[#020B27] hover:bg-gray-50 transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-bold text-[#020B27]">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Augmenter"
                className="w-10 h-11 flex items-center justify-center text-[#020B27] hover:bg-gray-50 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            <button onClick={handleAddToCart} disabled={!inStock}
              className={cn(
                "flex-1 min-w-[150px] h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all",
                inStock ? "bg-[#B8925A] text-white hover:bg-[#9E7A45]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
              )}>
              <ShoppingCart size={16} /> Ajouter au panier
            </button>

            <button onClick={() => setWishlisted((w) => !w)} aria-label="Ajouter aux favoris"
              className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center hover:border-red-300 transition-colors shrink-0">
              <Heart size={18} className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>
          </div>

          {/* WhatsApp */}
          <a href={whatsappMsg} target="_blank" rel="noopener noreferrer"
            className="w-full h-11 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Commander via WhatsApp
          </a>

          {/* Reassurance */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { icon: Truck, text: "Livraison à Casablanca" },
              { icon: Package, text: "Paiement à la livraison" },
              { icon: ShieldCheck, text: "Produit authentique" },
              { icon: MessageCircle, text: "Support WhatsApp 7j/7" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Icon size={13} className="text-green shrink-0" /> {text}
              </div>
            ))}
          </div>

          {/* Full page link */}
          <Link href={`/produit/${product.slug}`} onClick={onClose}
            className="mt-1 flex items-center justify-center gap-1 text-sm font-medium text-green hover:underline">
            Voir la fiche complète <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
