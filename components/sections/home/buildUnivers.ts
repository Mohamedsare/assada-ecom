import type { Product, Category } from "@/types";
import type { Univers } from "./NosUnivers";

/**
 * Construit les données « Nos Univers » (les 3 grands axes RYTA) côté serveur,
 * en regroupant les produits par axe (sous-catégories incluses).
 * Repli sur les catégories de tête si aucun axe n'existe encore en base.
 */
export function buildUnivers(products: Product[], categories: Category[]): Univers[] {
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

  // Les 3 grands axes RYTA. Matching souple par nom (accents/casse ignorés).
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const AXES: { label: string; match: (n: string) => boolean }[] = [
    { label: "Beauté", match: (n) => n.includes("beaut") },
    { label: "Compléments alimentaires", match: (n) => n.includes("complement") },
    { label: "Produits locaux", match: (n) => n.includes("loca") || n.includes("terroir") },
  ];
  const findAxisCat = (axis: (typeof AXES)[number]) => topCats.find((c) => axis.match(norm(c.name)));

  let univers: Univers[] = AXES
    .map((axis) => ({ axis, cat: findAxisCat(axis) }))
    .filter((x): x is { axis: (typeof AXES)[number]; cat: Category } => Boolean(x.cat))
    .map(({ axis, cat }) => ({ name: axis.label, slug: cat.slug, products: productsOf(cat).slice(0, 8) }));

  // Repli uniquement si AUCUN axe n'existe encore en base.
  if (univers.length === 0) {
    univers = topCats
      .map((c) => ({ name: c.name, slug: c.slug, products: productsOf(c).slice(0, 8) }))
      .filter((u) => u.products.length >= 2)
      .slice(0, 5);
  }

  return univers;
}
