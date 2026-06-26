"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MessageCircle } from "lucide-react";
import { formatPrice, formatDate, getWhatsAppUrl } from "@/lib/utils";
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

export default function CommandesContent({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (filterStatus && o.order_status !== filterStatus) return false;
    if (filterPayment && o.payment_method !== filterPayment) return false;
    if (search && !o.order_number.toLowerCase().includes(search.toLowerCase()) &&
        !o.customer_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#16A34A]"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#16A34A]"
        >
          <option value="">Tous les paiements</option>
          <option value="cash_on_delivery">Espèces</option>
          <option value="airtel_money">Airtel Money</option>
          <option value="moov_money">Moov Money</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="N° commande ou client..."
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#16A34A] flex-1 min-w-32"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Commande", "Client", "Articles", "Total", "Paiement", "Statut", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs text-[#64748B] font-medium py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#64748B] text-sm">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-[#0F172A]">{order.order_number}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-[#0F172A]">{order.customer_name}</p>
                        <p className="text-xs text-[#64748B]">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[#64748B]">
                        {order.items?.length ?? 0} article{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-[#16A34A]">{formatPrice(order.total_amount)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-[#64748B]">{PAYMENT_LABELS[order.payment_method]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.order_status}
                        disabled={updating === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer disabled:opacity-60 ${STATUS_COLOR[order.order_status]}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-[#64748B]">{formatDate(order.created_at)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/suivi-commande?numero=${order.order_number}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#16A34A] transition-colors"
                          title="Voir le détail"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          href={getWhatsAppUrl(`Bonjour ${order.customer_name}, votre commande ${order.order_number} est en cours de traitement.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#25D366] transition-colors"
                          title="Contacter sur WhatsApp"
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
      </div>
    </div>
  );
}
