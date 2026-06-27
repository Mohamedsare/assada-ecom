"use client";

import { useState, useMemo, useTransition } from "react";
import { CreditCard, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
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

export default function PaiementsContent({ payments }: { payments: Payment[] }) {
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() =>
    payments.filter((p) =>
      (p.order?.order_number ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (p.order?.customer_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (p.reference ?? "").toLowerCase().includes(query.toLowerCase())
    ), [payments, query]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#0F172A]">Paiements</h1>
        <p className="text-text-secondary text-sm mt-0.5">{payments.length} transaction(s) enregistrée(s)</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi icon={CheckCircle2} label="Encaissé" value={formatPrice(stats.encaisse)} color="text-green bg-green-50" />
        <Kpi icon={Clock} label="En attente" value={formatPrice(stats.enAttente)} color="text-orange-600 bg-orange-50" />
        <Kpi icon={CheckCircle2} label="Paiements réussis" value={String(stats.nbPaid)} color="text-blue-600 bg-blue-50" />
        <Kpi icon={XCircle} label="À encaisser" value={String(stats.nbPending)} color="text-purple-600 bg-purple-50" />
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-72">
          <Search size={15} className="text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="N° commande, client, référence..." className="bg-transparent text-sm outline-none flex-1 text-[#0F172A]" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A]">Aucun paiement</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Commande", "Méthode", "Montant", "Référence", "Date", "Statut"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => <PaymentRow key={p.id} payment={p} />)}
              </tbody>
            </table>
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
      <td className="py-3 px-4">
        <p className="text-sm font-bold text-[#0F172A]">{payment.order?.order_number ?? "—"}</p>
        <p className="text-xs text-text-secondary">{payment.order?.customer_name ?? "—"}</p>
      </td>
      <td className="py-3 px-4"><span className="text-sm text-text-secondary">{METHOD_LABELS[payment.method] ?? payment.method}</span></td>
      <td className="py-3 px-4"><span className="text-sm font-bold text-[#0F172A]">{formatPrice(payment.amount)}</span></td>
      <td className="py-3 px-4"><span className="text-xs text-text-secondary">{payment.reference ?? "—"}</span></td>
      <td className="py-3 px-4"><span className="text-sm text-text-secondary">{formatDate(payment.created_at)}</span></td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[status] ?? "bg-gray-100"}`}>
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-[#0F172A] leading-none truncate">{value}</p>
        <p className="text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  );
}
