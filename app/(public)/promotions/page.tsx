import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/supabase/queries";
import { ChevronRight, Tag } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Les meilleures promotions d'Odm's Shopping au Gabon. Jusqu'à -50% sur une large sélection de produits.",
};

export default async function PromotionsPage() {
  const allProducts = await getProducts({ is_promo: true });

  return (
    <div>
      <div
        className="text-white py-14 px-4 relative overflow-hidden"
        style={{
          backgroundImage: "url('/banners/promotions.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-night/35" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#EF4444]/20 text-red-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4 border border-red-400/30">
                <Tag size={14} />
                Offres limitées
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Des promotions<br />
                <span className="text-[#22C55E]">qui font plaisir !</span>
              </h1>
              <p className="text-gray-300 text-lg">
                Profitez de réductions exceptionnelles sur une large sélection de produits.
              </p>
            </div>
            <div className="flex gap-4 justify-center md:justify-end">
              {["-20%", "-30%", "-50%"].map((badge) => (
                <div
                  key={badge}
                  className="w-20 h-20 bg-[#EF4444] rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg rotate-6 hover:rotate-0 transition-transform"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {allProducts.length} produits en promotion
            </h2>
            <p className="text-[#64748B] text-sm mt-1">Offres valables jusqu&apos;à épuisement des stocks</p>
          </div>
        </div>

        {allProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Aucune promotion en ce moment</h3>
            <Link href="/boutique" className="text-[#16A34A] hover:underline">
              Voir toute la boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[#EF4444] text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Voir toute la boutique <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
