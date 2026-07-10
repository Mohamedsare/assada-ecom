"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Minus,
  Plus,
  Play,
  Package,
  Check,
} from "lucide-react";
import { formatPrice, calculateDiscount, getWhatsAppUrl, getProductOrderWhatsAppUrl, cn } from "@/lib/utils";
import { colorToHex, isLightColor } from "@/lib/colors";
import type { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/stores/cart";
import { openCartDrawer, addToast } from "@/lib/ui-actions";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-[#020B27]">{rating.toFixed(1)}</span>
      <span className="text-xs text-[#64748B]">({count} avis)</span>
    </div>
  );
}

export default function ProductPageContent({ product, relatedProducts }: Props) {
  const cartItems  = useCartStore((s) => s.items);
  const _addItem   = useCartStore((s) => s.addItem);

  const images = product.images?.length ? product.images : product.main_image_url
    ? [{ id: "main", product_id: product.id, image_url: product.main_image_url, alt_text: product.name, sort_order: 0 }]
    : [];

  // Médias = photos + éventuelle vidéo (affichés dans la même galerie)
  const media = [
    ...images.map((img) => ({ kind: "image" as const, key: img.id, url: img.image_url, alt: img.alt_text ?? product.name })),
    ...(product.video_url ? [{ kind: "video" as const, key: "video", url: product.video_url, alt: product.name }] : []),
  ];

  const [activeImage, setActiveImage] = useState(0);
  const activeMedia = media[activeImage];
  const goPrevMedia = () => setActiveImage((i) => (i - 1 + media.length) % media.length);
  const goNextMedia = () => setActiveImage((i) => (i + 1) % media.length);

  // Zoom-loupe sur l'image principale (suit le curseur).
  // Désactivé sur mobile / écrans tactiles (pas de survol réel).
  const [canZoom, setCanZoom] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanZoom(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const [zooming, setZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x, y });
  };
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "avis">("description");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  // Derive unique colors and sizes from variants
  const variants = product.variants ?? [];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes  = [...new Set(variants.map((v) => v.size).filter(Boolean))]  as string[];

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [selectedSize, setSelectedSize]   = useState<string | null>(sizes[0]  ?? null);

  const matchingVariant: ProductVariant | undefined = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const effectivePrice = product.current_price + (matchingVariant?.price_adjustment ?? 0);
  const discount = product.old_price ? calculateDiscount(product.old_price, product.current_price) : 0;
  const inStock = matchingVariant ? matchingVariant.stock_quantity > 0 : product.stock_quantity > 0;

  const sizesForColor = selectedColor
    ? variants.filter((v) => v.color === selectedColor).map((v) => v.size!)
    : sizes;

  const colorsForSize = selectedSize
    ? variants.filter((v) => v.size === selectedSize).map((v) => v.color!)
    : colors;

  const handleAddToCart = () => {
    const existing = cartItems.find(
      (i) => i.product.id === product.id && i.variant?.id === matchingVariant?.id
    );
    _addItem(product, matchingVariant, quantity);
    openCartDrawer();
    addToast(
      existing
        ? { type: "info",    title: "Quantité mise à jour", message: product.name }
        : { type: "success", title: "Ajouté au panier",     message: product.name }
    );
  };

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  // Question générale (sans détails de commande)
  const whatsappMsg = getWhatsAppUrl(
    `Bonjour RYTA, je suis intéressé par ce produit : ${product.name}\nLien : ${pageUrl}`
  );

  // Commande complète : reprend toutes les options choisies par le client
  const whatsappOrderMsg = getProductOrderWhatsAppUrl({
    name: product.name,
    brand: product.brand?.name,
    color: selectedColor,
    size: selectedSize,
    quantity,
    unitPrice: effectivePrice,
    url: pageUrl,
  });

  const tabs = [
    { key: "description", label: "Description" },
    { key: "specs",       label: "Caractéristiques" },
    { key: "avis",        label: `Avis (${product.review_count ?? 0})` },
  ] as const;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-[#F8FAFC] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap">
            <Link href="/" className="hover:text-[#020B27] transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/boutique" className="hover:text-[#020B27] transition-colors">Boutique</Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-[#020B27] transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-[#020B27] font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ── Images ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden bg-[#F8FAFC] border border-gray-100",
                canZoom && activeMedia?.kind === "image" && "cursor-zoom-in"
              )}
              onMouseEnter={() => canZoom && activeMedia?.kind === "image" && setZooming(true)}
              onMouseLeave={() => setZooming(false)}
              onMouseMove={canZoom && activeMedia?.kind === "image" ? handleZoomMove : undefined}
            >
              {activeMedia?.kind === "video" ? (
                <video src={activeMedia.url} controls className="w-full h-full object-contain bg-black" />
              ) : activeMedia ? (
                <Image
                  src={activeMedia.url}
                  alt={activeMedia.alt}
                  fill
                  className="object-contain p-4 transition-transform duration-200 ease-out will-change-transform"
                  style={{
                    transform: zooming ? "scale(1.9)" : "scale(1)",
                    transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl text-gray-200">📦</div>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.is_new && (
                  <span className="bg-[#020B27] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                    Nouveau
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-[#EF4444] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    -{discount}%
                  </span>
                )}
              </div>
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted((w) => !w)}
                aria-label="Ajouter aux favoris"
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
              >
                <Heart size={16} className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>

              {/* Carousel arrows */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={goPrevMedia}
                    aria-label="Média précédent"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-[#020B27] hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goNextMedia}
                    aria-label="Média suivant"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-[#020B27] hover:bg-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                  {/* Compteur */}
                  <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {activeImage + 1} / {media.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {media.map((m, i) => (
                  <button
                    key={m.key}
                    onClick={() => setActiveImage(i)}
                    aria-label={m.kind === "video" ? "Voir la vidéo" : `Photo ${i + 1}`}
                    className={cn(
                      "relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                      i === activeImage ? "border-[#020B27]" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {m.kind === "video" ? (
                      <div className="w-full h-full bg-[#020B27] flex items-center justify-center">
                        <Play size={18} className="text-white fill-white" />
                      </div>
                    ) : (
                      <Image
                        src={m.url}
                        alt={m.alt}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos produit ── */}
          <div className="flex flex-col gap-5">
            {/* Brand + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <span className="text-xs font-bold text-[#020B27] uppercase tracking-widest">
                  {product.brand.name}
                </span>
              )}
              {product.sku && (
                <span className="text-xs text-[#64748B] bg-gray-100 px-2 py-0.5 rounded">
                  Réf : {product.sku}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#020B27] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && product.review_count && (
              <StarRating rating={product.rating} count={product.review_count} />
            )}

            {/* Price */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-extrabold text-[#020B27]">
                {formatPrice(effectivePrice)}
              </span>
              {product.old_price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.old_price)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-bold text-white bg-[#EF4444] px-2 py-0.5 rounded-md">
                  Économisez {formatPrice(product.old_price! - product.current_price)}
                </span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-[#64748B] text-sm leading-relaxed">{product.short_description}</p>
            )}

            <div className="w-full h-px bg-gray-100" />

            {/* Color selector */}
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
                      <button
                        key={color}
                        onClick={() => available && setSelectedColor(color)}
                        disabled={!available}
                        title={color}
                        aria-label={color}
                        aria-pressed={isSelected}
                        className={cn(
                          "relative w-9 h-9 rounded-full transition-transform hover:scale-110",
                          isSelected ? "ring-2 ring-offset-2 ring-[#020B27]" : "ring-1 ring-gray-300",
                          !available && "opacity-40 cursor-not-allowed hover:scale-100"
                        )}
                        style={{ background: hex ?? "conic-gradient(#DC6B5C,#facc15,#4ade80,#60a5fa,#c084fc,#DC6B5C)" }}
                      >
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

            {/* Size selector */}
            {sizes.length > 0 && sizes[0] !== "Unique" && (
              <div>
                <p className="text-sm font-semibold text-[#020B27] mb-2">
                  Taille : <span className="font-normal text-[#64748B]">{selectedSize ?? "—"}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size) => {
                    const available = sizesForColor.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        className={cn(
                          "w-12 h-10 rounded-lg border text-sm font-semibold transition-all",
                          selectedSize === size
                            ? "border-[#B8925A] bg-[#B8925A] text-white"
                            : available
                            ? "border-gray-200 text-[#020B27] hover:border-[#B8925A]"
                            : "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", inStock ? "bg-[#020B27]" : "bg-[#EF4444]")} />
              <span className={cn("text-sm font-medium", inStock ? "text-[#020B27]" : "text-[#EF4444]")}>
                {inStock
                  ? `En stock (${matchingVariant?.stock_quantity ?? product.stock_quantity} disponibles)`
                  : "Rupture de stock"}
              </span>
            </div>

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-[#020B27] hover:bg-gray-50 transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#020B27]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-[#020B27] hover:bg-gray-50 transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                  "flex-1 min-w-[160px] h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all",
                  inStock
                    ? "bg-[#B8925A] text-white hover:bg-[#9E7A45]"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                )}
              >
                <ShoppingCart size={16} /> Ajouter au panier
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={whatsappOrderMsg}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Commander via WhatsApp
            </a>

            {/* Delivery info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Truck,       text: "Livraison partout au Maroc en 24–72h" },
                { icon: Package,     text: "Paiement à la livraison" },
                { icon: ShieldCheck, text: "Produit authentique garanti" },
                { icon: Phone,       text: "Support WhatsApp 7j/7" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Icon size={14} className="text-[#020B27] shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  if (navigator.share) navigator.share({ title: product.name, url: window.location.href });
                }}
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#020B27] transition-colors"
              >
                <Share2 size={13} /> Partager
              </button>
              <span className="text-gray-200">|</span>
              <a href={whatsappMsg} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#B8925A] transition-colors">
                <MessageCircle size={13} /> Poser une question
              </a>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-12 border-b border-gray-100">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all",
                  activeTab === tab.key
                    ? "border-[#020B27] text-[#020B27]"
                    : "border-transparent text-[#64748B] hover:text-[#020B27]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === "description" && (
            <div className="max-w-3xl">
              {product.description ? (
                <div className="text-[#020B27] text-sm leading-relaxed space-y-3 whitespace-pre-line">
                  {product.description.split("\n\n").map((para, i) => (
                    <p key={i} className={para.startsWith("**") ? "font-semibold" : ""}>
                      {para.replace(/\*\*/g, "")}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[#64748B] text-sm">Aucune description disponible.</p>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-xl">
              <table className="w-full text-sm">
                <tbody>
                  {(
                    [
                      product.brand    ? ["Marque",     product.brand.name]    : null,
                      product.category ? ["Catégorie",  product.category.name] : null,
                      product.sku      ? ["Référence",  product.sku]           : null,
                      ["Disponibilité", inStock ? "En stock" : "Rupture de stock"],
                      colors.length > 0 ? ["Couleurs disponibles", colors.join(", ")] : null,
                      sizes.length > 0 && sizes[0] !== "Unique" ? ["Tailles disponibles", sizes.join(", ")] : null,
                      ["Livraison", "Partout au Maroc en 24–72h"],
                      ["Paiement", "Espèces"],
                    ] as ([string, string] | null)[]
                  )
                    .filter((row): row is [string, string] => row !== null)
                    .map(([label, value], i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-[#F8FAFC]" : ""}>
                        <td className="py-2.5 px-4 font-medium text-[#020B27] w-44 rounded-l-lg">{label}</td>
                        <td className="py-2.5 px-4 text-[#64748B] rounded-r-lg">{value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "avis" && (
            <div className="max-w-2xl">
              {product.rating && (
                <div className="bg-[#F8FAFC] rounded-2xl p-6 mb-6 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-[#020B27]">{product.rating.toFixed(1)}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={14} className={s <= Math.round(product.rating!) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">{product.review_count} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map((star) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-[#64748B]">{star}</span>
                        <Star size={10} className="fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: star === Math.round(product.rating!) ? "60%" : star === Math.round(product.rating!) - 1 ? "25%" : "5%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-[#64748B] text-center py-4">
                Les avis clients seront disponibles prochainement.
              </p>
            </div>
          )}
        </div>

        {/* ── Produits similaires ── */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-gray-100 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#020B27]">Produits similaires</h2>
              <Link
                href={product.category ? `/boutique?categorie=${product.category.slug}` : "/boutique"}
                className="text-sm text-[#020B27] font-medium hover:underline flex items-center gap-1"
              >
                Voir plus <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Bloc réassurance ── */}
        <section className="mt-12 bg-[#020B27] rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
          <div className="flex items-start gap-3">
            <Truck size={22} className="text-[#C9A063] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Livraison rapide</p>
              <p className="text-xs text-white/60 mt-0.5">Partout au Maroc en 24 à 72h. Gratuite à partir de 300 DH pour tout le Maroc.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="text-[#C9A063] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Produits authentiques</p>
              <p className="text-xs text-white/60 mt-0.5">Tous nos produits sont originaux et garantis.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw size={22} className="text-[#C9A063] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Retour facile</p>
              <p className="text-xs text-white/60 mt-0.5">Satisfait ou remboursé. Support WhatsApp disponible.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
