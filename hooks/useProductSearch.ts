"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

const SELECT = `
  *,
  category:categories(*),
  brand:brands(*),
  images:product_images(*),
  variants:product_variants(*)
`;

/** Nettoie un token pour l'injecter sans risque dans un filtre `.or(...)` PostgREST. */
function sanitizeToken(t: string): string {
  return t.replace(/[%,()\\*]/g, " ").trim();
}

/**
 * Recherche multi-mots : chaque mot doit apparaître dans au moins un champ
 * (nom / description courte / description / SKU). Les `.or()` chaînés sont
 * combinés en ET → recherche « intelligente » façon moteur.
 */
export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const tokens = query.split(/\s+/).map(sanitizeToken).filter(Boolean);
  if (tokens.length === 0) return [];

  const supabase = createClient();
  let q = supabase.from("products").select(SELECT).eq("status", "active");

  for (const tok of tokens) {
    q = q.or(
      `name.ilike.%${tok}%,short_description.ilike.%${tok}%,description.ilike.%${tok}%,sku.ilike.%${tok}%`
    );
  }

  q = q
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as Product[];
}

interface Options {
  debounce?: number;
  limit?: number;
  minLength?: number;
}

/**
 * Recherche asynchrone debouncée avec garde anti-course :
 * seule la réponse de la requête la plus récente est appliquée.
 */
export function useProductSearch(
  query: string,
  { debounce = 250, limit = 24, minLength = 2 }: Options = {}
) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < minLength) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const id = ++reqId.current;
    const timer = setTimeout(async () => {
      const data = await searchProducts(q, limit);
      // Ignore les réponses périmées (requête plus ancienne qui revient en retard)
      if (id === reqId.current) {
        setResults(data);
        setLoading(false);
      }
    }, debounce);

    return () => clearTimeout(timer);
  }, [query, debounce, limit, minLength]);

  return { results, loading };
}
