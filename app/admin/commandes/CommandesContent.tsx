"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, MessageCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice, formatDate, getClientWhatsAppUrl } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { adminUpdateOrderStatus } from "@/lib/supabase/actions";
import type { Order } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-blue-100 text-blue-700",
  preparing:        "bg-purple-100 text-purple-700",
  shipped:          "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:        "bg-green-100 text-[#16A34A]",
  cancelled:        "bg-red-100 text-red-700",
  returned:         "bg-gray-100 text-gray-700",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Espèces",
  airtel_money:     "Airtel Money",
  moov_money:       "Moov Money",
};

const DATE_FILTERS: { value: string; label: string }[] = [
  { value: "all",   label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "7d",    label: "7 derniers jours" },
  { value: "30d",   label: "30 derniers jours" },
];

const PAGE_SIZE = 15;

export default function CommandesContent({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  // Référence temporelle figée au montage pour les filtres de date relatifs.
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.order_status === "delivered")
      .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    return {
      total: orders.length,
      pending: orders.filter((o) => o.order_status === "pending").length,
      delivered: orders.filter((o) => o.order_status === "delivered").length,
      revenue,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const dayMs = 86_400_000;
    return orders.filter((o) => {
      if (filterStatus && o.order_status !== filterStatus) return false;
      if (filterPayment && o.payment_method !== filterPayment) return false;
      if (q && !o.order_number.toLowerCase().includes(q) &&
          !o.customer_name.toLowerCase().includes(q) &&
          !(o.customer_phone ?? "").includes(q)) return false;
      if (filterDate !== "all") {
        const age = now - new Date(o.created_at).getTime();
        if (filterDate === "today") {
          const d = new Date(o.created_at); const today = new Date();
          if (d.toDateString() !== today.toDateString()) return false;
        } else if (filterDate === "7d" && age > 7 * dayMs) return false;
        else if (filterDate === "30d" && age > 30 * dayMs) return false;
      }
      return true;
    });
  }, [orders, filterStatus, filterPayment, filterDate, search, now]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdating(orderId);
    await adminUpdateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, order_status: newStatus as Order["order_status"] } : o)
    );
    setUpdating(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Gestion des commandes</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{orders.length} commandes</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total commandes" value={String(stats.total)} tone="default" />
        <StatCard label="En attente" value={String(stats.pending)} tone="orange" />
        <StatCard label="Livrées" value={String(stats.delivered)} tone="green" />
        <StatCard label="CA livré" value={formatPrice(stats.revenue)} tone="green" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="N° commande, client ou téléphone…"
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#16A34A] bg-white">
            <option value="">Tous les statuts</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#16A34A] bg-white">
            <option value="">Tous les paiements</option>
            <option value="cash_on_delivery">Espèces</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="moov_money">Moov Money</option>
          </select>
          <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#16A34A] bg-white">
            {DATE_FILTERS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Commande", "Client", "Articles", "Total", "Paiement", "Statut", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-[#64748B] font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748B] text-sm">Aucune commande trouvée</td>
                </tr>
              ) : (
                paged.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/admin/commandes/${order.id}`} className="text-sm font-bold text-[#0F172A] hover:text-[#16A34A] transition-colors">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-[#0F172A]">{order.customer_name}</p>
                      <p className="text-xs text-[#64748B]">{order.customer_phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[#64748B]">
                        {order.items?.length ?? 0} article{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-[#16A34A] whitespace-nowrap">{formatPrice(order.total_amount)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-[#64748B] whitespace-nowrap">{PAYMENT_LABELS[order.payment_method]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.order_status}
                        disabled={updating === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer disabled:opacity-60 ${STATUS_COLOR[order.order_status]}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-[#64748B] whitespace-nowrap">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/commandes/${order.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#16A34A] transition-colors" title="Voir le détail">
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={getClientWhatsAppUrl(order.customer_phone, `Bonjour ${order.customer_name}, votre commande ${order.order_number} est en cours de traitement.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#25D366] transition-colors"
                          title="Contacter le client sur WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-50 text-sm">
            <p className="text-[#64748B]">
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-[#0F172A] font-medium">{currentPage} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "default" | "green" | "orange" | "red" }) {
  const tones: Record<string, string> = {
    default: "text-[#0F172A]",
    green: "text-[#16A34A]",
    orange: "text-orange-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-[#64748B] mb-1">{label}</p>
      <p className={`text-xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
