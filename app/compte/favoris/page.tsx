import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { getCurrentProfile, getUserWishlist } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function FavorisPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const favoriteProducts = await getUserWishlist(profile.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-[#020B27] mb-6">
        Mes favoris ({favoriteProducts.length})
      </h1>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-[#020B27] mb-2">Aucun favori</p>
          <p className="text-[#64748B] mb-6">
            Ajoutez des produits à vos favoris pour les retrouver ici
          </p>
          <Link
            href="/boutique"
            className="bg-[#B8925A] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#9E7A45] transition-colors"
          >
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
