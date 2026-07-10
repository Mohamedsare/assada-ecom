"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X, ShoppingCart, Minus, Plus, Trash2, Truck, ArrowRight,
  CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/stores/cart";
import { useUIStore, type Toast } from "@/stores/ui";
import { useConfigStore } from "@/stores/config";
import { formatPrice, cn } from "@/lib/utils";
import QuickView from "@/components/product/QuickView";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOAST_ICONS = {
  success: <CheckCircle size={17} className="text-[#020B27] shrink-0" />,
  error:   <XCircle     size={17} className="text-[#EF4444] shrink-0" />,
  info:    <ShoppingCart size={17} className="text-blue-500 shrink-0" />,
  warning: <AlertTriangle size={17} className="text-[#F97316] shrink-0" />,
};
const TOAST_BAR_CLASS = {
  success: "bg-[#020B27]",
  error:   "bg-[#EF4444]",
  info:    "bg-blue-500",
  warning: "bg-[#F97316]",
};

// ─── UIShell ──────────────────────────────────────────────────────────────────

export default function UIShell() {
  const toasts      = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <>
      <CartDrawerPortal />
      <QuickView />
      <ToastContainerInner toasts={toasts} onRemove={removeToast} />
    </>
  );
}

// ─── CartDrawerPortal ─────────────────────────────────────────────────────────
// Gère uniquement le montage côté client du portal.
// CartDrawerInner s'abonne DIRECTEMENT aux stores — aucune prop intermédiaire.

function CartDrawerPortal() {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<CartDrawerInner />, document.body);
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

function CartDrawerInner() {
  // Abonnement direct : CartDrawerInner se re-rend lui-même quand l'état change,
  // sans dépendre du re-rendu d'un parent intermédiaire.
  const open       = useUIStore((s) => s.cartDrawerOpen);
  const onClose    = useUIStore((s) => s.closeCartDrawer);
  const addToast   = useUIStore((s) => s.addToast);

  const items      = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const _remove    = useCartStore((s) => s.removeItem);
  const _update    = useCartStore((s) => s.updateQuantity);
  const _clear     = useCartStore((s) => s.clearCart);

  const DELIVERY_FEE = useConfigStore((s) => s.deliveryFee);
  const FREE_DELIVERY_THRESHOLD = useConfigStore((s) => s.freeDeliveryThreshold);

  const removeItem = (id: string, name?: string) => {
    _remove(id);
    addToast({ type: "warning", title: "Article retiré", message: name });
  };
  const updateQty = (id: string, qty: number, name?: string) => {
    if (qty <= 0) { removeItem(id, name); return; }
    const cur = items.find((i) => i.id === id)?.quantity ?? 0;
    _update(id, qty);
    addToast({ type: "info", title: qty > cur ? "Quantité augmentée" : "Quantité diminuée", message: name });
  };
  const clearCart = () => {
    _clear();
    addToast({ type: "warning", title: "Panier vidé" });
  };

  const subtotal = totalPrice();
  const fee      = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total    = subtotal + fee;
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Votre panier"
        aria-modal="true"
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[100] flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#020B27] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} />
            <h2 className="font-bold text-base">Mon panier</h2>
            {totalItems() > 0 && (
              <span className="bg-[#B8925A] text-[#020B27] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems() > 9 ? "9+" : totalItems()}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={32} className="text-gray-300" />
            </div>
            <div>
              <p className="font-bold text-[#020B27] text-lg">Votre panier est vide</p>
              <p className="text-[#64748B] text-sm mt-1">Découvrez nos produits</p>
            </div>
            <button onClick={onClose} className="mt-2 bg-[#B8925A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm btn-sweep hover:bg-[#9E7A45] transition-colors">
              Voir la boutique
            </button>
          </div>
        ) : (
          <>
            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 shrink-0">
                <p className="text-xs text-blue-700 mb-1.5">
                  Plus que <span className="font-bold">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span> pour la livraison gratuite 🎉
                </p>
                <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => {
                const unitPrice = item.product.current_price + (item.variant?.price_adjustment ?? 0);
                return (
                  <div key={item.id} className="flex gap-3 group">
                    <Link href={`/produit/${item.product.slug}`} onClick={onClose}
                      className="relative w-20 h-20 bg-[#F8FAFC] rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      {item.product.main_image_url
                        ? <Image src={item.product.main_image_url} alt={item.product.name} fill className="object-contain p-1.5" sizes="80px" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/produit/${item.product.slug}`} onClick={onClose}
                        className="text-sm font-semibold text-[#020B27] line-clamp-2 hover:text-[#020B27] transition-colors leading-snug">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {item.variant.color && <span className="text-[10px] text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded">{item.variant.color}</span>}
                          {item.variant.size && item.variant.size !== "Unique" && <span className="text-[10px] text-[#64748B] bg-gray-100 px-1.5 py-0.5 rounded">{item.variant.size}</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.id, item.quantity - 1, item.product.name)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Diminuer"><Minus size={11} /></button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1, item.product.name)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label="Augmenter"><Plus size={11} /></button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#020B27]">{formatPrice(unitPrice * item.quantity)}</p>
                          {item.quantity > 1 && <p className="text-[10px] text-gray-400">{formatPrice(unitPrice)} / u</p>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id, item.product.name)} className="self-start p-1 text-gray-300 hover:text-[#EF4444] transition-colors opacity-0 group-hover:opacity-100" aria-label="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 px-5 pt-4 pb-6 shrink-0 space-y-3 bg-white">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#64748B]">
                  <span>Sous-total</span>
                  <span className="font-medium text-[#020B27]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span className="flex items-center gap-1"><Truck size={12} />Livraison</span>
                  <span className={cn("font-medium", fee === 0 ? "text-[#020B27]" : "text-[#020B27]")}>{fee === 0 ? "Gratuite 🎉" : formatPrice(fee)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-bold text-[#020B27]">Total</span>
                <span className="text-xl font-extrabold text-[#020B27]">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout" onClick={onClose} className="w-full flex items-center justify-center gap-2 bg-[#B8925A] btn-sweep hover:bg-[#9E7A45] text-white py-3.5 rounded-xl font-bold text-sm transition-colors">
                Passer la commande <ArrowRight size={16} />
              </Link>
              <Link href="/panier" onClick={onClose} className="w-full flex items-center justify-center gap-1 text-[#64748B] hover:text-[#020B27] py-2 text-sm font-medium transition-colors">
                Voir le panier complet <ArrowRight size={13} />
              </Link>
              <button onClick={clearCart} className="w-full text-center text-xs text-gray-400 hover:text-[#EF4444] transition-colors py-1">
                Vider le panier
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ─── ToastContainer ───────────────────────────────────────────────────────────

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(true), 10);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div className={cn(
      "relative w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300",
      visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
    )}>
      <div className={cn("absolute top-0 left-0 h-0.5 animate-shrink-x", TOAST_BAR_CLASS[toast.type])} style={{ animationDuration: `${toast.duration ?? 3500}ms` }} />
      <div className="flex items-start gap-3 p-4">
        {TOAST_ICONS[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#020B27] leading-tight">{toast.title}</p>
          {toast.message && <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{toast.message}</p>}
        </div>
        <button onClick={close} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 -mt-0.5" aria-label="Fermer"><X size={14} /></button>
      </div>
    </div>
  );
}

function ToastContainerInner({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted || toasts.length === 0) return null;
  return createPortal(
    <div aria-live="polite" className="fixed top-20 right-4 z-[200] flex flex-col gap-2 items-end">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
    </div>,
    document.body
  );
}
