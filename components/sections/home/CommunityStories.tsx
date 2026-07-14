"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Maximize2, Volume2, VolumeX, Play, Pause, X, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart";
import { useUIStore } from "@/stores/ui";

/**
 * « Histoires de la communauté » — galerie de cartes VIDÉO façon masonry.
 * Chaque carte lit une vidéo produit (autoplay muet) ; un clic ouvre un modal
 * shoppable : vidéo à gauche (avec son + barre de progression), galerie photos,
 * sélecteur de quantité et bouton « Ajouter au panier » à droite.
 */

// Décalage vertical (desktop) pour l'effet masonry organique.
const STAGGER = ["md:mt-4", "md:mt-12", "md:mt-0", "md:mt-10", "md:mt-6"];
// Format de la vignette : la carte centrale est plus haute.
const ASPECT = ["aspect-[4/5]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/5]", "aspect-[4/5]"];

function productImages(product: Product) {
  if (product.images?.length) {
    return [...product.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url);
  }
  return product.main_image_url ? [product.main_image_url] : [];
}

// ─── Carte vidéo ────────────────────────────────────────────────────────────

function StoryVideoCard({ product, i, onOpen }: { product: Product; i: number; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const avatar = productImages(product)[0] ?? "";

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = soundOn; // si le son était ON, on remet muet
    setSoundOn((s) => !s);
  };

  return (
    <div className={`shrink-0 w-[62%] sm:w-[42%] md:w-auto snap-start ${STAGGER[i] ?? ""}`}>
      {/* Vignette vidéo */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Voir la vidéo : ${product.name}`}
        className={`group relative block w-full ${ASPECT[i] ?? "aspect-[4/5]"} rounded-2xl overflow-hidden bg-gray-900`}
      >
        {product.video_url && (
          <video
            ref={videoRef}
            src={product.video_url}
            poster={avatar || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Voile léger + indice de lecture */}
        <span className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-colors" />
        <span className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-black/45 backdrop-blur-sm flex items-center justify-center text-white opacity-80 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={15} />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-white/85 flex items-center justify-center text-[#0A2A52] shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
            <Play size={20} className="fill-current translate-x-0.5" />
          </span>
        </span>
        {/* Bouton son */}
        <span
          role="button"
          tabIndex={0}
          onClick={toggleSound}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleSound(e as unknown as React.MouseEvent); }}
          aria-label={soundOn ? "Couper le son" : "Activer le son"}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/65 transition-colors"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </span>
      </button>

      {/* Carte info */}
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left -mt-3 relative mx-2 flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow"
      >
        <span className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-1 ring-gray-100">
          {avatar && <Image src={avatar} alt="" fill sizes="36px" className="object-cover" />}
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold text-[#0A2A52] leading-tight line-clamp-2 underline decoration-transparent group-hover:decoration-inherit">{product.name}</span>
          <span className="block text-[10px] text-text-secondary mt-0.5">À partir de {formatPrice(product.current_price)}</span>
        </span>
      </button>
    </div>
  );
}

// ─── Modal shoppable ────────────────────────────────────────────────────────

function StoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useUIStore((s) => s.addToast);
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  const images = productImages(product);
  const inStock = product.stock_quantity > 0;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fn);
    };
  }, [onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = soundOn;
    setSoundOn((s) => !s);
  };

  const handleAdd = () => {
    const existing = cartItems.find((it) => it.product.id === product.id && !it.variant);
    addItem(product, undefined, quantity);
    onClose();
    openCartDrawer();
    addToast(
      existing
        ? { type: "info", title: "Quantité mise à jour", message: product.name }
        : { type: "success", title: "Ajouté au panier", message: product.name }
    );
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Vidéo : ${product.name}`}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-4xl max-h-[94vh] sm:max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-quickview"
        >
          {/* Fermer */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#0A2A52] hover:bg-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* ── Vidéo ── */}
          <div className="relative md:w-1/2 bg-black shrink-0 aspect-[4/5] md:aspect-auto">
            {product.video_url && (
              <video
                ref={videoRef}
                src={product.video_url}
                poster={images[0] || undefined}
                autoPlay
                muted
                loop
                playsInline
                onClick={togglePlay}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                }}
                className="w-full h-full object-cover cursor-pointer"
              />
            )}
            {/* Barre de progression */}
            <div className="absolute top-0 inset-x-0 h-1 bg-white/25">
              <div className="h-full bg-white transition-[width] duration-150" style={{ width: `${progress}%` }} />
            </div>
            {/* Play / pause */}
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Lecture"}
              className="absolute bottom-4 left-4 w-11 h-11 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/65 transition-colors"
            >
              {playing ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current translate-x-0.5" />}
            </button>
            {/* Son */}
            <button
              onClick={toggleSound}
              aria-label={soundOn ? "Couper le son" : "Activer le son"}
              className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/65 transition-colors"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* ── Détails ── */}
          <div className="md:w-1/2 flex flex-col p-5 sm:p-6 gap-4 overflow-y-auto">
            <div className="pr-10">
              {product.brand && (
                <p className="text-xs font-bold text-[#2F9E44] uppercase tracking-widest mb-1">{product.brand.name}</p>
              )}
              <Link href={`/produit/${product.slug}`} onClick={onClose}>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0A2A52] leading-tight hover:text-[#2F9E44] transition-colors">
                  {product.name}
                </h3>
              </Link>
            </div>

            {/* Galerie photos */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.slice(0, 4).map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                    <Image src={src} alt={`${product.name} ${idx + 1}`} fill sizes="(max-width: 768px) 45vw, 20vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {product.short_description && (
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{product.short_description}</p>
            )}

            <div className="mt-auto pt-2 flex items-center gap-3">
              {/* Quantité */}
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden shrink-0">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuer"
                  className="w-10 h-12 flex items-center justify-center text-[#0A2A52] hover:bg-gray-50 transition-colors">
                  <Minus size={15} />
                </button>
                <span className="w-9 text-center text-sm font-bold text-[#0A2A52]">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} aria-label="Augmenter"
                  className="w-10 h-12 flex items-center justify-center text-[#0A2A52] hover:bg-gray-50 transition-colors">
                  <Plus size={15} />
                </button>
              </div>

              {/* Ajouter au panier */}
              <button
                onClick={handleAdd}
                disabled={!inStock}
                className={cn(
                  "flex-1 h-12 rounded-full flex items-center justify-center gap-2 font-bold text-sm transition-colors",
                  inStock ? "bg-[#2F9E44] text-white btn-sweep hover:bg-[#237A34]" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                )}
              >
                <ShoppingCart size={17} />
                {inStock ? <>Ajouter au panier&nbsp;&nbsp;-&nbsp;&nbsp;{formatPrice(product.current_price)}</> : "Rupture de stock"}
              </button>
            </div>

            <Link href={`/produit/${product.slug}`} onClick={onClose}
              className="flex items-center justify-center gap-1 text-sm font-medium text-[#2F9E44] hover:underline">
              Voir la fiche complète <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

export default function CommunityStories({ products }: { products: Product[] }) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<Product | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Cartes = produits marqués « Histoires de la communauté » ET pourvus d'une vidéo.
  const items = products.filter((p) => p.is_story && p.video_url).slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0A2A52]">Histoires de la communauté</h2>
        </div>

        {/* Galerie — scroll horizontal sur mobile, masonry 5 colonnes sur desktop */}
        <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide items-start pb-2 md:pb-0">
          {items.map((product, i) => (
            <StoryVideoCard key={product.id} product={product} i={i} onOpen={() => setActive(product)} />
          ))}
        </div>
      </div>

      {/* Modal */}
      {mounted && active && createPortal(
        <StoryModal key={active.id} product={active} onClose={() => setActive(null)} />,
        document.body
      )}
    </section>
  );
}
