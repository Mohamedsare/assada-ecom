"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatPrice, calculateDiscount, getWhatsAppUrl, getProductOrderWhatsAppUrl, cn } from "@/lib/utils";
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
      <span className="text-sm font-semibold text-[#0F172A]">{rating.toFixed(1)}</span>
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

  // Zoom-loupe sur l'image principale (suit le curseur)
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
    `Bonjour Odm's Shopping, je suis intéressé par ce produit : ${product.name}\nLien : ${pageUrl}`
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
            <Link href="/" className="hover:text-[#16A34A] transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/boutique" className="hover:text-[#16A34A] transition-colors">Boutique</Link>
            {product.category && (
              <>
                <ChevronRight size={12} />
                <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-[#16A34A] transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} />
            <span className="text-[#0F172A] font-medium line-clamp-1">{product.name}</span>
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
                activeMedia?.kind === "image" && "cursor-zoom-in"
              )}
              onMouseEnter={() => activeMedia?.kind === "image" && setZooming(true)}
              onMouseLeave={() => setZooming(false)}
              onMouseMove={activeMedia?.kind === "image" ? handleZoomMove : undefined}
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
                  <span className="bg-[#16A34A] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-[#0F172A] hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goNextMedia}
                    aria-label="Média suivant"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md text-[#0F172A] hover:bg-white transition-colors"
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
                      i === activeImage ? "border-[#16A34A]" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {m.kind === "video" ? (
                      <div className="w-full h-full bg-[#020617] flex items-center justify-center">
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
                <span className="text-xs font-bold text-[#16A34A] uppercase tracking-widest">
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
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && product.review_count && (
              <StarRating rating={product.rating} count={product.review_count} />
            )}

            {/* Price */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-extrabold text-[#0F172A]">
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
                <p className="text-sm font-semibold text-[#0F172A] mb-2">
                  Couleur : <span className="font-normal text-[#64748B]">{selectedColor ?? "—"}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => {
                    const available = colorsForSize.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => available && setSelectedColor(color)}
                        disabled={!available}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                          selectedColor === color
                            ? "border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A]"
                            : available
                            ? "border-gray-200 text-[#0F172A] hover:border-[#16A34A]"
                            : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                        )}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && sizes[0] !== "Unique" && (
              <div>
                <p className="text-sm font-semibold text-[#0F172A] mb-2">
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
                            ? "border-[#16A34A] bg-[#16A34A] text-white"
                            : available
                            ? "border-gray-200 text-[#0F172A] hover:border-[#16A34A]"
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
              <div className={cn("w-2 h-2 rounded-full", inStock ? "bg-[#16A34A]" : "bg-[#EF4444]")} />
              <span className={cn("text-sm font-medium", inStock ? "text-[#16A34A]" : "text-[#EF4444]")}>
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
                  className="w-10 h-11 flex items-center justify-center text-[#0F172A] hover:bg-gray-50 transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#0F172A]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-[#0F172A] hover:bg-gray-50 transition-colors"
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
                    ? "bg-[#020617] text-white hover:bg-green"
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
              className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1ebe5c] text-white flex items-center justify-center gap-2 font-semibold text-sm transition-colors"
            >
              <MessageCircle size={16} />
              Commander via WhatsApp
            </a>

            {/* Delivery info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Truck,       text: "Livraison partout au Gabon" },
                { icon: Package,     text: "Paiement à la livraison" },
                { icon: ShieldCheck, text: "Produit authentique garanti" },
                { icon: Phone,       text: "Support WhatsApp 7j/7" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-[#64748B]">
                  <Icon size={14} className="text-[#16A34A] shrink-0" />
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
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <Share2 size={13} /> Partager
              </button>
              <span className="text-gray-200">|</span>
              <a href={whatsappMsg} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#25D366] transition-colors">
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
                    ? "border-[#16A34A] text-[#16A34A]"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A]"
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
                <div className="text-[#0F172A] text-sm leading-relaxed space-y-3 whitespace-pre-line">
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
                      ["Livraison", "Partout au Gabon"],
                      ["Paiement", "Espèces, Airtel Money, Moov Money"],
                    ] as ([string, string] | null)[]
                  )
                    .filter((row): row is [string, string] => row !== null)
                    .map(([label, value], i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-[#F8FAFC]" : ""}>
                        <td className="py-2.5 px-4 font-medium text-[#0F172A] w-44 rounded-l-lg">{label}</td>
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
                    <p className="text-5xl font-extrabold text-[#0F172A]">{product.rating.toFixed(1)}</p>
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
              <h2 className="text-xl md:text-2xl font-bold text-[#0F172A]">Produits similaires</h2>
              <Link
                href={product.category ? `/boutique?categorie=${product.category.slug}` : "/boutique"}
                className="text-sm text-[#16A34A] font-medium hover:underline flex items-center gap-1"
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
        <section className="mt-12 bg-[#020617] rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
          <div className="flex items-start gap-3">
            <Truck size={22} className="text-[#22C55E] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Livraison rapide</p>
              <p className="text-xs text-white/60 mt-0.5">Partout au Gabon. Livraison sous 24–72h à Libreville.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck size={22} className="text-[#22C55E] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Produits authentiques</p>
              <p className="text-xs text-white/60 mt-0.5">Tous nos produits sont originaux et garantis.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw size={22} className="text-[#22C55E] mt-0.5 shrink-0" />
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
