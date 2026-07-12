import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/supabase/queries";

export async function HomeLatestProducts() {
  const products = await getProducts({ limit: 8 });

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2A52]">
              Derniers produits ajoutés
            </h2>
            <p className="text-[#64748B] mt-1">Les nouveautés de la semaine</p>
          </div>
          <Link href="/boutique" className="flex items-center gap-1 text-[#0A2A52] font-medium text-sm hover:underline">
            Voir tout <ChevronRight size={16} />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <p>Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export async function HomePromoProducts() {
  const products = await getProducts({ is_promo: true, limit: 4 });

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0A2A52]">
              Meilleures offres du moment
            </h2>
            <p className="text-[#64748B] mt-1">Ne ratez pas ces promotions</p>
          </div>
          <Link href="/promotions" className="flex items-center gap-1 text-[#EF4444] font-medium text-sm hover:underline">
            Toutes les promos <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
