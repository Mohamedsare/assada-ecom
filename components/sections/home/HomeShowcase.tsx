import type { Product, Category } from "@/types";
import EditorPick from "./EditorPick";
import TestimonialQuote from "./TestimonialQuote";

/**
 * Ensemble de sections « façon apia » pour la page d'accueil (mobile & desktop) :
 * ensembles choix de l'éditeur → témoignage. Palette RYTA.
 * (« Nos Univers », « Beauté & bien-être » et le produit signature sont rendus dans page.tsx ;
 * le produit signature est recalculé ici uniquement pour l'exclure du « choix de l'éditeur ».)
 */
export default function HomeShowcase({
  products,
}: {
  products: Product[];
  categories: Category[];
}) {
  const withImage = products.filter((p) => p.main_image_url);

  // Produit signature : un produit vedette (sinon 1er avec image).
  const featureProduct = withImage.find((p) => p.is_featured) ?? withImage[0] ?? null;

  // Ensembles « choix de l'éditeur » : deux coffrets à partir de produits distincts.
  const pool = withImage.filter((p) => p.id !== featureProduct?.id);
  const pick1 = pool.slice(0, 4);
  const pick2 = pool.slice(4, 7);

  return (
    <div>
      {(pick1.length >= 2 || pick2.length >= 2) && (
        <section className="py-12 px-4 bg-gray-light">
          <div className="max-w-7xl mx-auto space-y-14">
            {pick1.length >= 2 && <EditorPick products={pick1} />}
            {pick2.length >= 2 && <EditorPick products={pick2} reverse />}
          </div>
        </section>
      )}

      <TestimonialQuote products={withImage.slice(0, 3)} />
    </div>
  );
}
