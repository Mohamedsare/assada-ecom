import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

/** Carte produit épurée (image + nom + prix) façon apia — pour les grilles de la home. */
export default function MiniProductCard({ product }: { product: Product }) {
  const image = product.main_image_url || product.images?.[0]?.image_url || "";

  // Prix « à partir de » quand le produit a des variantes à prix différents.
  const prices = [
    product.current_price,
    ...(product.variants ?? []).map((v) => product.current_price + (v.price_adjustment ?? 0)),
  ];
  const minPrice = Math.min(...prices);
  const hasRange = Math.max(...prices) > minPrice;
  return (
    <Link href={`/produit/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f5f5] border border-gray-100">
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 45vw, 22vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {product.old_price && product.old_price > product.current_price && (
          <span className="absolute top-3 left-3 bg-[#C0392B] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">Promo</span>
        )}
      </div>
      <div className="mt-2.5 text-center px-1">
        <p className="text-sm text-[#0A2A52] line-clamp-2 min-h-[2.5rem]">{product.name}</p>
        <p className="text-sm font-bold text-[#0A2A52] mt-1">
          {hasRange ? `À partir de ${formatPrice(minPrice)}` : formatPrice(product.current_price)}
        </p>
      </div>
    </Link>
  );
}
