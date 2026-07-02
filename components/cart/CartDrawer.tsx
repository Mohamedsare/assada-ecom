"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { useCartStore } from "@/stores/cart";
import { formatPrice, cn } from "@/lib/utils";

const DELIVERY_FEE = 2000;
const FREE_DELIVERY_THRESHOLD = 100000;

export default function CartDrawer() {
  const cartDrawerOpen  = useUIStore((s) => s.cartDrawerOpen);
  const closeCartDrawer = useUIStore((s) => s.closeCartDrawer);
  const addToast        = useUIStore((s) => s.addToast);

  const items          = useCartStore((s) => s.items);
  const totalItems     = useCartStore((s) => s.totalItems);
  const totalPrice     = useCartStore((s) => s.totalPrice);
  const _removeItem    = useCartStore((s) => s.removeItem);
  const _updateQty     = useCartStore((s) => s.updateQuantity);
  const _clearCart     = useCartStore((s) => s.clearCart);

  const removeItem = (itemId: string, productName?: string) => {
    _removeItem(itemId);
    addToast({ type: "warning", title: "Article retiré", message: productName });
  };

  const updateQuantity = (itemId: string, quantity: number, productName?: string) => {
    if (quantity <= 0) { removeItem(itemId, productName); return; }
    const current = items.find((i) => i.id === itemId)?.quantity ?? 0;
    _updateQty(itemId, quantity);
    addToast({ type: "info", title: quantity > current ? "Quantité augmentée" : "Quantité diminuée", message: productName });
  };

  const clearCart = () => {
    _clearCart();
    addToast({ type: "warning", title: "Panier vidé" });
  };

  const subtotal    = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total       = subtotal + deliveryFee;
  const progress    = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = cartDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCartDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCartDrawer]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCartDrawer}
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300",
          cartDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Votre panier"
        aria-modal="true"
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[100] flex flex-col transition-transform duration-300 ease-in-out",
          cartDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#020B27] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} />
            <h2 className="font-bold text-base">Mon panier</h2>
            {totalItems() > 0 && (
              <span className="bg-[#16A34A] text-[#020B27] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems() > 9 ? "9+" : totalItems()}
              </span>
            )}
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer le panier"
          >
            <X size={18} />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={32} className="text-gray-300" />
            </div>
            <div>
              <p className="font-bold text-[#020B27] text-lg">Votre panier est vide</p>
              <p className="text-[#64748B] text-sm mt-1">Découvrez nos produits et commencez vos achats</p>
            </div>
            <button
              onClick={closeCartDrawer}
              className="mt-2 bg-[#16A34A] text-[#020B27] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#15803D] transition-colors"
            >
              Voir la boutique
            </button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 shrink-0">
                <p className="text-xs text-blue-700 mb-1.5">
                  Plus que <span className="font-bold">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span> pour la livraison gratuite 🎉
                </p>
                <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => {
                const unitPrice = item.product.current_price + (item.variant?.price_adjustment ?? 0);
                return (
                  <div key={item.id} className="flex gap-3 group">
                    {/* Image */}
                    <Link
                      href={`/produit/${item.product.slug}`}
                      onClick={closeCartDrawer}
                      className="relative w-20 h-20 bg-[#F8FAFC] rounded-xl overflow-hidden shrink-0 border border-gray-100"
                    >
                      {item.product.main_image_url ? (
                        <Image
                          src={item.product.main_image_url}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/produit/${item.product.slug}`}
                        onClick={closeCartDrawer}
                        className="text-sm font-semibold text-[#020B27] line-clamp-2 hover:text-[#020B27] transition-colors leading-snug"
                      >
                        {item.product.name}
                      </Link>

                      {item.variant && (
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {item.variant.color && (
                            <span className="text-[10px] text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.variant.color}
                            </span>
                          )}
                          {item.variant.size && item.variant.size !== "Unique" && (
                            <span className="text-[10px] text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.variant.size}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity control */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.product.name)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#020B27]"
                            aria-label="Diminuer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#020B27]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.product.name)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors text-[#020B27]"
                            aria-label="Augmenter"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#020B27]">
                            {formatPrice(unitPrice * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-400">{formatPrice(unitPrice)} / u</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id, item.product.name)}
                      className="self-start p-1 text-gray-300 hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 pt-4 pb-6 shrink-0 space-y-3 bg-white">
              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#64748B]">
                  <span>Sous-total</span>
                  <span className="font-medium text-[#020B27]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Truck size={12} />
                    Livraison
                  </span>
                  <span className={cn("font-medium", deliveryFee === 0 ? "text-[#020B27]" : "text-[#020B27]")}>
                    {deliveryFee === 0 ? "Gratuite 🎉" : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-bold text-[#020B27]">Total</span>
                <span className="text-xl font-extrabold text-[#020B27]">{formatPrice(total)}</span>
              </div>

              {/* CTAs */}
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="w-full flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-[#020B27] py-3.5 rounded-xl font-bold text-sm transition-colors"
              >
                Passer la commande
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/panier"
                onClick={closeCartDrawer}
                className="w-full flex items-center justify-center gap-1 text-[#64748B] hover:text-[#020B27] py-2 text-sm font-medium transition-colors"
              >
                Voir le panier complet
                <ArrowRight size={13} />
              </Link>

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-gray-400 hover:text-[#EF4444] transition-colors py-1"
              >
                Vider le panier
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
