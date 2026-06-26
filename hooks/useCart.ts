"use client";

import { useCartStore } from "@/stores/cart";
import { openCartDrawer, addToast } from "@/lib/ui-actions";
import type { Product, ProductVariant } from "@/types";

export function useCart() {
  const items           = useCartStore((s) => s.items);
  const totalItems      = useCartStore((s) => s.totalItems);
  const totalPrice      = useCartStore((s) => s.totalPrice);
  const _addItem        = useCartStore((s) => s.addItem);
  const _removeItem     = useCartStore((s) => s.removeItem);
  const _updateQuantity = useCartStore((s) => s.updateQuantity);
  const _clearCart      = useCartStore((s) => s.clearCart);

  const addItem = (product: Product, variant?: ProductVariant, quantity = 1) => {
    const existing = items.find(
      (i) => i.product.id === product.id && i.variant?.id === variant?.id
    );
    _addItem(product, variant, quantity);
    openCartDrawer();
    addToast(
      existing
        ? { type: "info",    title: "Quantité mise à jour", message: product.name }
        : { type: "success", title: "Ajouté au panier",     message: product.name }
    );
  };

  const removeItem = (itemId: string, productName?: string) => {
    _removeItem(itemId);
    addToast({ type: "warning", title: "Article retiré", message: productName });
  };

  const updateQuantity = (itemId: string, quantity: number, productName?: string) => {
    if (quantity <= 0) { removeItem(itemId, productName); return; }
    const current = items.find((i) => i.id === itemId)?.quantity ?? 0;
    _updateQuantity(itemId, quantity);
    addToast({
      type: "info",
      title: quantity > current ? "Quantité augmentée" : "Quantité diminuée",
      message: productName,
    });
  };

  const clearCart = () => {
    _clearCart();
    addToast({ type: "warning", title: "Panier vidé" });
  };

  return { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart };
}
