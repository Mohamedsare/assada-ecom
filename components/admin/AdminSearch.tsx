"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Package, ShoppingBag, User, CornerDownLeft } from "lucide-react";
import { adminSearch } from "@/lib/supabase/actions";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

type Results = Awaited<ReturnType<typeof adminSearch>>;
const EMPTY: Results = { products: [], orders: [], clients: [] };

/** Élément à plat pour la navigation clavier. */
type FlatItem = { href: string; label: string };

export default function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const reqId = useRef(0);

  // Recherche asynchrone débouncée
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      const res = await adminSearch(q);
      if (id === reqId.current) {
        setResults(res);
        setLoading(false);
        setActive(0);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Fermeture au clic extérieur
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const flat: FlatItem[] = useMemo(() => [
    ...results.products.map((p) => ({ href: `/admin/produits/${p.id}/modifier`, label: p.name })),
    ...results.orders.map((o) => ({ href: `/admin/commandes/${o.id}`, label: o.order_number })),
    ...results.clients.map((c) => ({ href: `/admin/clients/${c.id}`, label: c.name })),
  ], [results]);

  const total = flat.length;
  const go = (href: string) => { setOpen(false); setQuery(""); router.push(href); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, total - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active].href);
      else if (query.trim()) go(`/admin/produits?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const showPanel = open && query.trim().length >= 2;
  let idx = -1; // index global courant pour le surlignage clavier

  return (
    <div className="relative flex-1 max-w-sm mx-auto" ref={boxRef}>
      <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#2F9E44] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2F9E44]/15 transition-colors">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher un produit, une commande, un client…"
          className="bg-transparent text-sm outline-none flex-1 text-[#0A2A52] placeholder-gray-500 min-w-0"
        />
        {loading ? (
          <Loader2 size={15} className="text-gray-400 animate-spin shrink-0" />
        ) : query ? (
          <button onClick={() => { setQuery(""); setOpen(false); }} className="text-gray-400 hover:text-[#0A2A52] shrink-0" aria-label="Effacer">
            <X size={15} />
          </button>
        ) : null}
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 text-[#0A2A52] max-h-[70vh] overflow-y-auto">
          {loading && total === 0 ? (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-text-secondary justify-center">
              <Loader2 size={16} className="animate-spin" /> Recherche…
            </div>
          ) : total === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-text-secondary">Aucun résultat pour « {query.trim()} »</p>
              <button
                onClick={() => go(`/admin/produits?q=${encodeURIComponent(query.trim())}`)}
                className="text-xs text-green font-medium mt-2 hover:underline"
              >
                Rechercher dans les produits
              </button>
            </div>
          ) : (
            <div className="py-1.5">
              {/* Produits */}
              {results.products.length > 0 && (
                <Group label="Produits">
                  {results.products.map((p) => {
                    idx++;
                    const i = idx;
                    return (
                      <Row key={p.id} href={`/admin/produits/${p.id}/modifier`} activeRow={i === active} onGo={go} onHover={() => setActive(i)}>
                        <span className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.image ? <Image src={p.image} alt="" width={32} height={32} className="object-cover w-full h-full" /> : <Package size={14} className="text-gray-400" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{p.name}</span>
                          <span className="block text-[11px] text-text-secondary">{formatPrice(p.price)}</span>
                        </span>
                      </Row>
                    );
                  })}
                </Group>
              )}

              {/* Commandes */}
              {results.orders.length > 0 && (
                <Group label="Commandes">
                  {results.orders.map((o) => {
                    idx++;
                    const i = idx;
                    return (
                      <Row key={o.id} href={`/admin/commandes/${o.id}`} activeRow={i === active} onGo={go} onHover={() => setActive(i)}>
                        <span className="w-8 h-8 rounded-md bg-gray-100 shrink-0 flex items-center justify-center">
                          <ShoppingBag size={14} className="text-gray-400" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{o.order_number} · {o.customer_name}</span>
                          <span className="block text-[11px] text-text-secondary">{ORDER_STATUS_LABELS[o.status] ?? o.status} · {formatPrice(o.total)}</span>
                        </span>
                      </Row>
                    );
                  })}
                </Group>
              )}

              {/* Clients */}
              {results.clients.length > 0 && (
                <Group label="Clients">
                  {results.clients.map((c) => {
                    idx++;
                    const i = idx;
                    return (
                      <Row key={c.id} href={`/admin/clients/${c.id}`} activeRow={i === active} onGo={go} onHover={() => setActive(i)}>
                        <span className="w-8 h-8 rounded-full bg-night text-white shrink-0 flex items-center justify-center text-[11px] font-bold">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium truncate">{c.name}</span>
                          {c.email && <span className="block text-[11px] text-text-secondary truncate">{c.email}</span>}
                        </span>
                      </Row>
                    );
                  })}
                </Group>
              )}

              <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] text-text-secondary border-t border-gray-50">
                <CornerDownLeft size={12} /> Entrée pour ouvrir · ↑↓ pour naviguer · Échap pour fermer
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-4 pt-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      {children}
    </div>
  );
}

function Row({
  href, activeRow, onGo, onHover, children,
}: {
  href: string; activeRow: boolean; onGo: (href: string) => void; onHover: () => void; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      onClick={(e) => { e.preventDefault(); onGo(href); }}
      className={`flex items-center gap-3 px-4 py-2 transition-colors ${activeRow ? "bg-[#2F9E44]/10" : "hover:bg-gray-50"}`}
    >
      {children}
    </Link>
  );
}
