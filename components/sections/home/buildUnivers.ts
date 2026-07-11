import type { Product, Category } from "@/types";
import type { Univers } from "./NosUnivers";

/**
 * Construit les données « Nos Univers » côté serveur : les 3 grands axes RYTA,
 * chacun avec ses sous-catégories (cercles) et leurs produits, plus un repli
 * produits au niveau de l'axe (pour les axes sans sous-catégories).
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
    { label: "Beauté et bien-être", match: (n) => n.includes("beaut") },
    { label: "Compléments alimentaires", match: (n) => n.includes("complement") },
    { label: "Produits du terroir", match: (n) => n.includes("loca") || n.includes("terroir") },
  ];

  const univers: Univers[] = [];
  for (const axis of AXES) {
    const cat = topCats.find((c) => axis.match(norm(c.name)));
    if (!cat) continue;

    // Toutes les sous-catégories de l'axe (même sans produit — l'utilisateur veut
    // pouvoir parcourir la structure ; l'état vide est géré à l'affichage).
    const subcats = (childrenByParent.get(cat.id) ?? [])
      .map((c) => ({ name: c.name, slug: c.slug, image: c.image_url, products: productsOf(c).slice(0, 8) }));

    const axisProducts = productsOf(cat).slice(0, 8);

    // On affiche toujours l'axe s'il a des sous-catégories ; sinon seulement s'il a des produits.
    if (subcats.length > 0 || axisProducts.length > 0) {
      univers.push({ name: axis.label, slug: cat.slug, subcats, products: axisProducts });
    }
  }

  // Repli : si aucun axe reconnu, on prend les catégories de tête avec produits.
  if (univers.length === 0) {
    for (const c of topCats) {
      const p = productsOf(c).slice(0, 8);
      if (p.length >= 2) univers.push({ name: c.name, slug: c.slug, subcats: [], products: p });
    }
  }

  return univers.slice(0, 5);
}
