import Link from "next/link";
import Image from "next/image";
import { Sparkles, Leaf, ShieldCheck, Zap, Star, Droplet } from "lucide-react";
import type { Product } from "@/types";

/** Bloc produit signature façon apia « Magic Balm » : image centrée entourée de pastilles bénéfices. */
const PILLS_LEFT = [
  { icon: Droplet, label: "Peau éclatante" },
  { icon: Leaf, label: "Formule soignée" },
  { icon: ShieldCheck, label: "Produit authentique" },
];
const PILLS_RIGHT = [
  { icon: Star, label: "Qualité premium" },
  { icon: Zap, label: "Résultat visible" },
  { icon: Sparkles, label: "Absorption rapide" },
];

// Décalage horizontal par rang : la pastille du milieu ressort vers l'extérieur
// pour que les 3 pastilles dessinent un arc autour du produit (effet circulaire).
const ARC_LEFT = ["md:-translate-x-2", "md:-translate-x-10", "md:-translate-x-2"];
const ARC_RIGHT = ["md:translate-x-2", "md:translate-x-10", "md:translate-x-2"];

// Animation au survol : la pastille se soulève, grossit et son ombre s'accentue.
const PILL_BASE =
  "inline-flex items-center gap-2.5 bg-gray-light text-[#020B27] text-sm px-6 py-3.5 rounded-full shadow-sm cursor-default " +
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:bg-white hover:shadow-lg";

export default function FeatureProduct({ product }: { product: Product }) {
  const image = product.main_image_url || product.images?.[0]?.image_url || "";

  return (
    <section className="py-14 px-4 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[#B8925A] mb-2">Le soin signature</p>
        <h2 className="text-2xl md:text-3xl font-bold text-[#020B27] mb-2">{product.name}</h2>
        {product.short_description && (
          <p className="text-text-secondary max-w-xl mx-auto mb-10">{product.short_description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
          {/* Pastilles gauche — disposées en arc */}
          <div className="flex flex-col items-center md:items-end gap-4 order-2 md:order-1">
            {PILLS_LEFT.map(({ icon: Icon, label }, i) => (
              <span key={label} className={`${PILL_BASE} ${ARC_LEFT[i]}`}>
                <Icon size={15} className="text-[#B8925A]" /> {label}
              </span>
            ))}
          </div>

          {/* Image centrale */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto rounded-3xl overflow-hidden bg-[#f5f5f5] order-1 md:order-2 shadow-inner ring-1 ring-black/5">
            {image && <Image src={image} alt={product.name} fill sizes="288px" className="object-cover" />}
          </div>

          {/* Pastilles droite — disposées en arc */}
          <div className="flex flex-col items-center md:items-start gap-4 order-3">
            {PILLS_RIGHT.map(({ icon: Icon, label }, i) => (
              <span key={label} className={`${PILL_BASE} ${ARC_RIGHT[i]}`}>
                <Icon size={15} className="text-[#B8925A]" /> {label}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/produit/${product.slug}`}
          className="inline-flex items-center justify-center mt-10 bg-green btn-sweep hover:bg-[#9E7A45] text-white font-semibold px-8 py-3.5 rounded-full transition-colors active:scale-95"
        >
          Voir le produit
        </Link>
      </div>
    </section>
  );
}
