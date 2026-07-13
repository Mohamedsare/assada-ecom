import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Product } from "@/types";

/**
 * Section « Offres » : deux bannières commerciales (coffrets & promotions),
 * façon apia. Palette RYTA (vert / bleu profond). Purement éditorial : les
 * liens pointent vers les pages Coffrets cadeaux et Promotions. Un produit
 * choisi au hasard illustre chaque carte.
 */
const BANNERS = [
  {
    href: "/coffrets-cadeaux",
    title: "Coffrets & compositions à offrir sans hésiter",
    subtitle: "Des idées cadeaux prêtes à faire plaisir, toute l'année.",
    cta: "J'en profite",
    gradient: "from-[#2F9E44] to-[#237A34]",
  },
  {
    href: "/promotions",
    title: "Nos meilleures promotions du moment",
    subtitle: "Jusqu'à -50 % sur une sélection de produits.",
    cta: "J'en profite",
    gradient: "from-[#0A2A52] to-[#061C38]",
  },
] as const;

export default function PromoBanners({ products }: { products: Product[] }) {
  // Deux produits distincts choisis au hasard pour illustrer les cartes.
  const withImage = products.filter((p) => p.main_image_url);
  const shuffled = [...withImage].sort(() => Math.random() - 0.5);

  return (
    <section className="py-10 px-4 bg-gray-light">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2F9E44] mb-1">Offres</p>
          <h2 className="text-xl md:text-2xl font-bold text-[#0A2A52]">Nos offres à ne pas manquer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BANNERS.map(({ href, title, subtitle, cta, gradient }, idx) => {
            const product = shuffled[idx];
            return (
              <Link
                key={href}
                href={href}
                className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${gradient} text-white p-6 sm:p-8 flex flex-col justify-between min-h-44 shadow-sm transition-transform duration-300 hover:-translate-y-0.5`}
              >
                {/* Photo produit à droite (choisie au hasard) */}
                {product?.main_image_url && (
                  <div className="absolute right-2 sm:right-5 bottom-2 top-2 w-24 sm:w-40 pointer-events-none">
                    <Image
                      src={product.main_image_url}
                      alt={product.name}
                      fill
                      sizes="160px"
                      className="object-contain object-bottom drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="relative z-10 max-w-[62%] sm:max-w-xs">
                  <h3 className="text-lg sm:text-xl font-extrabold leading-snug">{title}</h3>
                  <p className="text-white/80 text-sm mt-2">{subtitle}</p>
                </div>
                <span className="relative z-10 mt-5 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide">
                  {cta}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 text-right">
          <Link
            href="/promotions"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F9E44] hover:underline"
          >
            Voir plus de promotions <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
