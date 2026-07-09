import type { Product, Category } from "@/types";
import type { BeautyCat } from "./BeauteBienEtre";

/**
 * Construit les données « Beauté & bien-être » côté serveur :
 * les sous-catégories de l'axe Beauté, avec leurs 4 premiers produits (image requise).
 */
export function buildBeautyCats(products: Product[], categories: Category[]): BeautyCat[] {
  const withImage = products.filter((p) => p.main_image_url);

  const childrenByParent = new Map<string, Category[]>();
  for (const c of categories) {
    if (c.parent_id) {
      const arr = childrenByParent.get(c.parent_id) ?? [];
      arr.push(c);
      childrenByParent.set(c.parent_id, arr);
    }
  }
  const descendantSlugs = (cat: Category): Set<string> => {
    const set = new Set<string>([cat.slug]);
    const stack = [cat];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const child of childrenByParent.get(cur.id) ?? []) {
        set.add(child.slug);
        stack.push(child);
      }
    }
    return set;
  };

  const topCats = categories.filter((c) => !c.parent_id);
  const productsOf = (cat: Category) => {
    const slugs = descendantSlugs(cat);
    return withImage.filter((p) => p.category?.slug && slugs.has(p.category.slug));
  };

  // Normalisation (accents/casse) pour retrouver l'axe Beauté.
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const beauteCat = topCats.find((c) => norm(c.name).includes("beaut"));

  return (beauteCat ? childrenByParent.get(beauteCat.id) ?? [] : [])
    .map((c) => ({ name: c.name, slug: c.slug, image: c.image_url, products: productsOf(c).slice(0, 4) }))
    .filter((c) => c.products.length >= 1)
    .slice(0, 6);
}
