"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search, ChevronLeft, ChevronRight, Trash2, X, Loader2 } from "lucide-react";
import { formatPrice, formatDate, getClientWhatsAppUrl } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { adminUpdateOrderStatus, adminDeleteOrder, generateOrderConfirmationMessage } from "@/lib/supabase/actions";
import type { Order } from "@/types";

/** Logo WhatsApp officiel (SVG de marque). */
function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-blue-100 text-blue-700",
  preparing:        "bg-purple-100 text-purple-700",
  shipped:          "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:        "bg-green-100 text-[#020B27]",
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
  // Resynchronise la liste quand le temps réel déclenche un router.refresh() :
  // les nouvelles données server-rendered arrivent via initialOrders. Pattern
  // « ajuster l'état pendant le rendu » (recommandé plutôt qu'un useEffect).
  const [prevInitial, setPrevInitial] = useState(initialOrders);
  if (initialOrders !== prevInitial) {
    setPrevInitial(initialOrders);
    setOrders(initialOrders);
  }
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [waLoading, setWaLoading] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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

  async function handleWhatsApp(order: Order) {
    if (waLoading) return;
    setWaLoading(order.id);
    // Ouvre l'onglet de façon synchrone pour ne pas être bloqué par le navigateur,
    // puis on le redirige vers WhatsApp une fois le message généré.
    const win = window.open("", "_blank");
    try {
      const { message } = await generateOrderConfirmationMessage(order.id);
      const url = getClientWhatsAppUrl(order.customer_phone, message);
      if (win && !win.closed) win.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setWaLoading(null);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    const res = await adminDeleteOrder(toDelete.id);
    setDeleting(false);
    if (res?.error) {
      setDeleteError(res.error);
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== toDelete.id));
    setToDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#020B27]">Gestion des commandes</h1>
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
            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#B8925A] transition-colors"
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#B8925A] bg-white">
            <option value="">Tous les statuts</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#B8925A] bg-white">
            <option value="">Tous les paiements</option>
            <option value="cash_on_delivery">Paiement à la livraison</option>
          </select>
          <select value={filterDate} onChange={(e) => { setFilterDate(e.target.value); resetPage(); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#B8925A] bg-white">
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
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link href={`/admin/commandes/${order.id}`} className="text-sm font-bold text-[#020B27] hover:text-[#020B27] transition-colors">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-sm text-[#020B27]">{order.customer_name}</p>
                      <p className="text-xs text-[#64748B]">{order.customer_phone}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-sm text-[#64748B]">
                        {order.items?.length ?? 0} article{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-[#020B27] whitespace-nowrap">{formatPrice(order.total_amount)}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs text-[#64748B] whitespace-nowrap">{PAYMENT_LABELS[order.payment_method]}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={order.order_status}
                        disabled={updating === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer disabled:opacity-60 ${STATUS_COLOR[order.order_status]}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs text-[#64748B] whitespace-nowrap">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/commandes/${order.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors" title="Voir le détail">
                          <Eye size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(order)}
                          disabled={waLoading === order.id}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-whatsapp transition-colors disabled:opacity-60"
                          title="Confirmer sur WhatsApp (message généré par l'IA)"
                        >
                          {waLoading === order.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <WhatsAppIcon size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setToDelete(order); setDeleteError(null); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                          title="Supprimer la commande"
                        >
                          <Trash2 size={15} />
                        </button>
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
              <span className="px-2 text-[#020B27] font-medium">{currentPage} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modale de confirmation de suppression */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setToDelete(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button
              onClick={() => !deleting && setToDelete(null)}
              disabled={deleting}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#020B27] transition-colors disabled:opacity-40"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[#020B27]">Supprimer la commande</h2>
                <p className="text-sm text-[#64748B] mt-1">
                  La commande <span className="font-semibold text-[#020B27]">{toDelete.order_number}</span> et
                  toutes ses données associées (articles, paiement) seront définitivement supprimées.
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">{deleteError}</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-[#64748B] rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {deleting && <Loader2 size={15} className="animate-spin" />}
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "default" | "green" | "orange" | "red" }) {
  const tones: Record<string, string> = {
    default: "text-[#020B27]",
    green: "text-[#020B27]",
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
