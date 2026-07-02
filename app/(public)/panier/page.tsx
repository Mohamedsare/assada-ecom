"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowLeft,
  Truck, ShieldCheck, RotateCcw, Headphones, ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { useConfigStore } from "@/stores/config";
import { addToast } from "@/lib/ui-actions";
import { formatPrice } from "@/lib/utils";

export default function PanierPage() {
  const items       = useCartStore((s) => s.items);
  const totalPrice  = useCartStore((s) => s.totalPrice);
  const totalItems  = useCartStore((s) => s.totalItems);
  const _removeItem = useCartStore((s) => s.removeItem);
  const _updateQty  = useCartStore((s) => s.updateQuantity);
  const _clearCart  = useCartStore((s) => s.clearCart);
  const DELIVERY_FEE = useConfigStore((s) => s.deliveryFee);
  const FREE_DELIVERY_THRESHOLD = useConfigStore((s) => s.freeDeliveryThreshold);

  const removeItem = (id: string, name?: string) => {
    _removeItem(id);
    addToast({ type: "warning", title: "Article retiré", message: name });
  };
  const updateQuantity = (id: string, qty: number, name?: string) => {
    if (qty <= 0) { removeItem(id, name); return; }
    const current = items.find((i) => i.id === id)?.quantity ?? 0;
    _updateQty(id, qty);
    addToast({ type: "info", title: qty > current ? "Quantité augmentée" : "Quantité diminuée", message: name });
  };
  const clearCart = () => {
    _clearCart();
    addToast({ type: "warning", title: "Panier vidé" });
  };

  const subtotal    = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total       = subtotal + deliveryFee;

  /* ── Panier vide ── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-[#020B27] mb-2">Votre panier est vide</h1>
          <p className="text-[#64748B] mb-8">Découvrez nos produits et commencez vos achats</p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[#16A34A] text-[#020B27] px-8 py-4 rounded-2xl font-semibold text-base active:scale-95 transition-all"
          >
            <ShoppingCart size={18} />
            Voir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 lg:pb-0">

      {/* ── Bannière ── */}
      <div
        className="relative text-white py-10 md:py-14 px-4 overflow-hidden"
        style={{
          backgroundImage: "url('/banners/banner2-accueil.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-night/35" />
        <div className="relative max-w-6xl mx-auto">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Continuer mes achats
          </Link>
          <h1 className="text-3xl font-bold">Votre panier</h1>
          <p className="text-gray-300 mt-1">
            {totalItems()} article{totalItems() !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">

          {/* ── Colonne articles ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Header articles */}
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#020B27]">
                Articles <span className="text-gray-400 font-normal">({items.length})</span>
              </h2>
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-sm text-[#EF4444] font-medium py-2 px-3 rounded-xl active:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Vider
              </button>
            </div>

            {/* Liste articles */}
            {items.map((item) => {
              const unitPrice = item.product.current_price + (item.variant?.price_adjustment || 0);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl shrink-0 overflow-hidden relative">
                      {item.product.main_image_url ? (
                        <Image
                          src={item.product.main_image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.product.category && (
                            <p className="text-xs text-[#64748B] uppercase tracking-wide mb-0.5 truncate">
                              {item.product.category.name}
                            </p>
                          )}
                          <h3 className="font-semibold text-[#020B27] text-sm leading-snug line-clamp-2">
                            {item.product.name}
                          </h3>
                          {item.variant && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {item.variant.size && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                  Taille : {item.variant.size}
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                  Couleur : {item.variant.color}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.product.name)}
                          className="p-2 text-gray-300 hover:text-[#EF4444] active:scale-90 transition-all shrink-0 rounded-lg"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantité + prix — ligne séparée pour lisibilité mobile */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    {/* Contrôles quantité — grands pour mobile */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.product.name)}
                        className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-[#020B27]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.product.name)}
                        className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <p className="font-bold text-[#020B27] text-base">
                        {formatPrice(unitPrice * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatPrice(unitPrice)} / unité
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* ── Récapitulatif (sidebar desktop / card mobile) ── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-bold text-[#020B27] text-lg mb-5">Récapitulatif</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Sous-total ({totalItems()} article{totalItems() !== 1 ? "s" : ""})
                  </span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Livraison</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? "text-green" : ""}`}>
                    {deliveryFee === 0 ? "Gratuite 🎉" : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Code promo</span>
                  <span className="text-xs text-text-secondary">À appliquer au paiement</span>
                </div>
              </div>

              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-700 leading-relaxed">
                  Ajoutez encore{" "}
                  <span className="font-bold">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span>{" "}
                  pour bénéficier de la livraison gratuite !
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#020B27] text-base">Total</span>
                  <span className="font-extrabold text-xl text-green">{formatPrice(total)}</span>
                </div>
              </div>

              {/* CTA desktop */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-green text-[#020B27] py-4 rounded-2xl font-bold text-base hover:bg-[#15803D] active:scale-95 transition-all"
              >
                Passer la commande
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/boutique"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-[#020B27] py-3.5 rounded-2xl font-medium text-sm mt-3 hover:bg-gray-50 active:scale-95 transition-all"
              >
                Continuer mes achats
              </Link>

              {/* Avantages */}
              <div className="mt-5 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
                {[
                  { icon: ShieldCheck,  text: "Paiement sécurisé",        color: "text-blue-500" },
                  { icon: Truck,        text: "Livraison rapide",          color: "text-green" },
                  { icon: RotateCcw,    text: "Satisfait ou remboursé",    color: "text-purple-500" },
                  { icon: Headphones,   text: "Support WhatsApp 7j/7",     color: "text-orange-500" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Icon size={14} className={`${color} shrink-0`} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre fixe mobile ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-text-secondary">Total ({totalItems()} article{totalItems() !== 1 ? "s" : ""})</p>
            <p className="font-extrabold text-green text-lg leading-tight">{formatPrice(total)}</p>
          </div>
          <Link
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-green text-[#020B27] py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all"
          >
            Commander
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
