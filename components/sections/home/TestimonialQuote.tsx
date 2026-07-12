import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

/** Témoignage centré + 3 visuels produits, façon apia. */
export default function TestimonialQuote({ products }: { products: Product[] }) {
  const shots = products.filter((p) => p.main_image_url).slice(0, 3);

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <span className="text-6xl leading-none text-[#2F9E44]/40 font-serif">”</span>
        <p className="text-lg md:text-xl text-[#0A2A52] leading-relaxed mt-2 mb-3">
          Tellement bien ! Livraison rapide, produits authentiques et bien emballés.
          La texture est parfaite, un vrai coup de cœur — je recommande RYTA les yeux fermés !
        </p>
        <p className="text-sm text-text-secondary mb-10">Salma — Maârif, Casablanca</p>

        {shots.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {shots.map((p) => (
              <Link key={p.id} href={`/produit/${p.slug}`} className="relative aspect-square rounded-2xl overflow-hidden bg-[#f5f5f5] group">
                <Image src={p.main_image_url!} alt={p.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
