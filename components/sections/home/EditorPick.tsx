"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";
import { openCartDrawer, addToast } from "@/lib/ui-actions";

/**
 * « Ensemble choix de l'éditeur » façon apia : un visuel + une liste de produits
 * avec « Tout ajouter au panier ». `reverse` inverse image/liste (blocs alternés).
 */
export default function EditorPick({
  title = "Ensemble choix de l'éditeur",
  products,
  coverImage,
  reverse = false,
}: {
  title?: string;
  products: Product[];
  coverImage?: string;
  reverse?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  if (products.length === 0) return null;

  const total = products.reduce((sum, p) => sum + p.current_price, 0);
  const cover = coverImage || products[0]?.main_image_url || "";

  const addAll = () => {
    products.forEach((p) => addItem(p));
    openCartDrawer();
    addToast({ type: "success", title: "Ensemble ajouté", message: `${products.length} produits ajoutés au panier` });
  };

  return (
    <div className={cn("grid md:grid-cols-2 gap-6 lg:gap-10 items-center", reverse && "md:[direction:rtl]")}>
      {/* Visuel */}
      <div className="relative aspect-[4/5] sm:aspect-square rounded-3xl overflow-hidden bg-[#f5f5f5] md:[direction:ltr]">
        {cover && <Image src={cover} alt={title} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />}
      </div>

      {/* Liste produits + total */}
      <div className="md:[direction:ltr]">
        <h2 className="text-2xl md:text-3xl font-bold text-[#020B27] mb-5">{title}</h2>

        <div className="divide-y divide-gray-100 border-y border-gray-100 mb-5">
          {products.map((p) => (
            <Link key={p.id} href={`/produit/${p.slug}`} className="flex items-center gap-3 py-3 group">
              <span className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#f5f5f5] shrink-0">
                {p.main_image_url && <Image src={p.main_image_url} alt={p.name} fill sizes="56px" className="object-cover" />}
              </span>
              <span className="flex-1 min-w-0 text-sm text-[#020B27] group-hover:text-[#B8925A] transition-colors line-clamp-2">{p.name}</span>
              <span className="text-sm font-semibold text-[#020B27] shrink-0">{formatPrice(p.current_price)}</span>
            </Link>
          ))}
        </div>

        <button
          onClick={addAll}
          className="w-full flex items-center justify-center gap-2 bg-green btn-sweep hover:bg-[#9E7A45] text-white font-semibold px-6 py-3.5 rounded-full transition-colors active:scale-[0.98]"
        >
          <ShoppingBag size={18} /> Tout ajouter au panier · {formatPrice(total)}
        </button>
      </div>
    </div>
  );
}
