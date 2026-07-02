"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Abonnement Supabase Realtime global à l'admin : dès qu'une des tables clés
 * change (commande, paiement, produit, client…), on rafraîchit les données
 * server-rendered de la page courante ET du layout (KPI, graphiques, badges,
 * notifications) via router.refresh(). Les rafales d'événements (une commande
 * = plusieurs INSERT) sont regroupées par un léger debounce.
 *
 * ⚠️ Nécessite que ces tables soient publiées par Realtime dans Supabase
 * (voir supabase-realtime.sql). Sans ça, aucun événement n'est reçu.
 */
const TABLES = [
  "orders",
  "order_items",
  "payments",
  "products",
  "product_variants",
  "profiles",
  "categories",
  "brands",
  "reviews",
  "contact_messages",
  "settings",
  "delivery_agents",
];

export default function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const scheduleRefresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase.channel("admin-realtime");
    for (const table of TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleRefresh);
    }
    channel.subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
