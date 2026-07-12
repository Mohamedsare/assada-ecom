"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { CreditCard, Search, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { adminUpdatePayment } from "@/lib/supabase/actions";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";

const METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Espèces à la livraison",
  airtel_money: "Airtel Money",
  moov_money: "Moov Money",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payé" },
  { value: "failed", label: "Échoué" },
  { value: "refunded", label: "Remboursé" },
  { value: "cash_on_delivery", label: "À la livraison" },
];

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-50 text-green",
  pending: "bg-yellow-50 text-yellow-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
  cash_on_delivery: "bg-blue-50 text-blue-700",
};

const PAGE_SIZE = 15;

export default function PaiementsContent({ payments }: { payments: Payment[] }) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid");
    const pending = payments.filter((p) => p.status === "pending" || p.status === "cash_on_delivery");
    return {
      encaisse: paid.reduce((s, p) => s + p.amount, 0),
      enAttente: pending.reduce((s, p) => s + p.amount, 0),
      nbPaid: paid.length,
      nbPending: pending.length,
    };
  }, [payments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterMethod && p.method !== filterMethod) return false;
      if (q && !(p.order?.order_number ?? "").toLowerCase().includes(q) &&
          !(p.order?.customer_name ?? "").toLowerCase().includes(q) &&
          !(p.reference ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [payments, query, filterStatus, filterMethod]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A2A52]">Paiements</h1>
        <p className="text-text-secondary text-sm mt-0.5">{payments.length} transaction(s) enregistrée(s)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={CheckCircle2} label="Encaissé" value={formatPrice(stats.encaisse)} color="text-green bg-green-50" />
        <Kpi icon={Clock} label="En attente" value={formatPrice(stats.enAttente)} color="text-orange-600 bg-orange-50" />
        <Kpi icon={CheckCircle2} label="Paiements réussis" value={String(stats.nbPaid)} color="text-blue-600 bg-blue-50" />
        <Kpi icon={XCircle} label="À encaisser" value={String(stats.nbPending)} color="text-purple-600 bg-purple-50" />
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); resetPage(); }}
            placeholder="N° commande, client, référence…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green bg-white">
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterMethod} onChange={(e) => { setFilterMethod(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-green bg-white">
            <option value="">Toutes les méthodes</option>
            {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0A2A52]">Aucun paiement</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Commande", "Méthode", "Montant", "Référence", "Date", "Statut"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((p) => <PaymentRow key={p.id} payment={p} />)}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-50 text-sm">
            <p className="text-text-secondary">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-[#0A2A52] font-medium">{currentPage} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentRow({ payment }: { payment: Payment }) {
  const [status, setStatus] = useState(payment.status);
  const [pending, startTransition] = useTransition();

  const change = (next: string) => {
    setStatus(next as Payment["status"]);
    startTransition(() => { adminUpdatePayment(payment.id, next); });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4 whitespace-nowrap">
        {payment.order ? (
          <Link href={`/admin/commandes/${payment.order.id}`} className="text-sm font-bold text-[#0A2A52] hover:text-green transition-colors">
            {payment.order.order_number}
          </Link>
        ) : (
          <p className="text-sm font-bold text-[#0A2A52]">—</p>
        )}
        <p className="text-xs text-text-secondary">{payment.order?.customer_name ?? "—"}</p>
      </td>
      <td className="py-3 px-4 whitespace-nowrap"><span className="text-sm text-text-secondary whitespace-nowrap">{METHOD_LABELS[payment.method] ?? payment.method}</span></td>
      <td className="py-3 px-4 whitespace-nowrap"><span className="text-sm font-bold text-[#0A2A52] whitespace-nowrap">{formatPrice(payment.amount)}</span></td>
      <td className="py-3 px-4 whitespace-nowrap"><span className="text-xs text-text-secondary">{payment.reference ?? "—"}</span></td>
      <td className="py-3 px-4 whitespace-nowrap"><span className="text-sm text-text-secondary whitespace-nowrap">{formatDate(payment.created_at)}</span></td>
      <td className="py-3 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_BADGE[status] ?? "bg-gray-100"}`}>
            {STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status}
          </span>
          <select value={status} disabled={pending} onChange={(e) => change(e.target.value)} className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-green cursor-pointer disabled:opacity-50">
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </td>
    </tr>
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: typeof CreditCard; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-[#0A2A52] leading-none truncate">{value}</p>
        <p className="text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  );
}
