"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, Search, Users, Ban, CheckCircle2, Eye } from "lucide-react";
import { formatPrice, getClientWhatsAppUrl } from "@/lib/utils";
import { adminToggleUserActive } from "@/lib/supabase/actions";
import type { Profile } from "@/types";

type Stats = Record<string, { count: number; total: number }>;

export default function ClientsContent({ customers, stats }: { customers: Profile[]; stats: Stats }) {
  const [query, setQuery] = useState("");

  const kpis = useMemo(() => {
    const active = customers.filter((c) => c.is_active).length;
    const withOrders = customers.filter((c) => (stats[c.id]?.count ?? 0) > 0).length;
    return { total: customers.length, active, blocked: customers.length - active, withOrders };
  }, [customers, stats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.first_name, c.last_name, c.email, c.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [customers, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#020B27]">Clients</h1>
          <p className="text-text-secondary text-sm mt-0.5">{customers.length} clients enregistrés</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-56">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client..."
            className="bg-transparent text-sm outline-none flex-1 text-[#020B27]"
          />
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Clients" value={kpis.total} tone="default" />
        <StatCard label="Actifs" value={kpis.active} tone="green" />
        <StatCard label="Bloqués" value={kpis.blocked} tone="red" />
        <StatCard label="Ont commandé" value={kpis.withOrders} tone="default" />
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27] mb-2">Aucun client</p>
          <p className="text-text-secondary text-sm">Les clients apparaîtront ici après inscription</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Client", "Téléphone", "Commandes", "Total dépensé", "Statut", "Membre depuis", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-text-secondary text-sm">Aucun client ne correspond à « {query} ».</td></tr>
                ) : filtered.map((c) => <ClientRow key={c.id} client={c} stat={stats[c.id]} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({ client, stat }: { client: Profile; stat?: { count: number; total: number } }) {
  const [active, setActive] = useState(client.is_active);
  const [pending, startTransition] = useTransition();

  const initials = [client.first_name, client.last_name]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
  const displayName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "Utilisateur";

  const toggle = () => {
    const next = !active;
    if (!next && !confirm(`Bloquer ${displayName} ? Le client ne pourra plus se connecter.`)) return;
    setActive(next);
    startTransition(() => { adminToggleUserActive(client.id, next); });
  };

  const count = stat?.count ?? 0;
  const total = stat?.total ?? 0;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green rounded-full flex items-center justify-center text-[#020B27] font-bold text-xs shrink-0">{initials}</div>
          <div>
            <Link href={`/admin/clients/${client.id}`} className="text-sm font-medium text-[#020B27] hover:text-green transition-colors">{displayName}</Link>
            <p className="text-xs text-text-secondary">{client.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4"><span className="text-sm text-text-secondary">{client.phone ?? "—"}</span></td>
      <td className="py-3 px-4"><span className="text-sm font-medium text-[#020B27]">{count}</span></td>
      <td className="py-3 px-4"><span className="text-sm font-medium text-[#020B27]">{total > 0 ? formatPrice(total) : "—"}</span></td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-green-50 text-green" : "bg-red-50 text-red-600"}`}>
          {active ? "Actif" : "Bloqué"}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {new Date(client.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/clients/${client.id}`}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green transition-colors"
            title="Voir la fiche client"
          >
            <Eye size={15} />
          </Link>
          {client.phone && (
            <Link
              href={getClientWhatsAppUrl(client.phone, `Bonjour ${client.first_name ?? ""}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#B8925A] transition-colors"
              title="WhatsApp"
            >
              <MessageCircle size={15} />
            </Link>
          )}
          <button
            onClick={toggle}
            disabled={pending}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-60 ${active ? "text-red-500 hover:bg-red-50" : "text-green hover:bg-green-50"}`}
            title={active ? "Bloquer le client" : "Débloquer le client"}
          >
            {active ? <><Ban size={13} /> Bloquer</> : <><CheckCircle2 size={13} /> Débloquer</>}
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "default" | "green" | "red" }) {
  const tones: Record<string, string> = {
    default: "text-[#020B27]",
    green: "text-[#020B27]",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className={`text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
