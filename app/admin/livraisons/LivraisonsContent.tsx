"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Truck, MapPin, MessageCircle, Package, CheckCircle2 } from "lucide-react";
import { adminUpdateOrderStatus } from "@/lib/supabase/actions";
import { getWhatsAppUrl, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/types";

// Étapes de progression d'une livraison
const FLOW = ["confirmed", "preparing", "shipped", "out_for_delivery", "delivered"] as const;
const ACTIVE_STATUSES = ["confirmed", "preparing", "shipped", "out_for_delivery"];

export default function LivraisonsContent({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<"active" | "delivered">("active");

  const active = useMemo(() => orders.filter((o) => ACTIVE_STATUSES.includes(o.order_status)), [orders]);
  const delivered = useMemo(() => orders.filter((o) => o.order_status === "delivered"), [orders]);
  const list = tab === "active" ? active : delivered;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#0F172A]">Livraisons</h1>
        <p className="text-text-secondary text-sm mt-0.5">Suivez et faites avancer les livraisons en cours</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi icon={Package} label="À préparer" value={String(orders.filter((o) => o.order_status === "confirmed" || o.order_status === "preparing").length)} color="text-blue-600 bg-blue-50" />
        <Kpi icon={Truck} label="En transit" value={String(orders.filter((o) => o.order_status === "shipped" || o.order_status === "out_for_delivery").length)} color="text-orange-600 bg-orange-50" />
        <Kpi icon={CheckCircle2} label="Livrées" value={String(delivered.length)} color="text-green bg-green-50" />
        <Kpi icon={Truck} label="En cours" value={String(active.length)} color="text-purple-600 bg-purple-50" />
      </div>

      <div className="flex gap-1.5 mb-4">
        {([["active", `En cours (${active.length})`], ["delivered", `Livrées (${delivered.length})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === k ? "bg-night text-white" : "bg-white border border-gray-200 text-text-secondary hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Truck size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A]">Aucune livraison {tab === "active" ? "en cours" : "terminée"}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((o) => <DeliveryCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}

function DeliveryCard({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.order_status);
  const [pending, startTransition] = useTransition();

  const stepIndex = FLOW.indexOf(status as typeof FLOW[number]);
  const nextStatus = stepIndex >= 0 && stepIndex < FLOW.length - 1 ? FLOW[stepIndex + 1] : null;

  const advance = () => {
    if (!nextStatus) return;
    setStatus(nextStatus);
    startTransition(() => { adminUpdateOrderStatus(order.id, nextStatus); });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-[#0F172A]">{order.order_number}</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{ORDER_STATUS_LABELS[status] ?? status}</span>
      </div>

      <p className="text-sm text-[#0F172A]">{order.customer_name}</p>
      <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
        <MapPin size={12} /> {order.delivery_district}, {order.delivery_city}
      </p>
      <p className="text-sm font-bold text-green mt-1">{formatPrice(order.total_amount)}</p>

      {/* Progression */}
      <div className="flex items-center gap-1 mt-3">
        {FLOW.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= stepIndex ? "bg-green" : "bg-gray-100"}`} title={ORDER_STATUS_LABELS[s]} />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        {nextStatus ? (
          <button onClick={advance} disabled={pending} className="flex-1 text-xs font-semibold bg-green text-white px-3 py-2 rounded-lg hover:bg-[#15803d] disabled:opacity-60 transition-colors">
            {pending ? "…" : `Passer à : ${ORDER_STATUS_LABELS[nextStatus]}`}
          </button>
        ) : (
          <span className="flex-1 text-xs font-medium text-green flex items-center gap-1"><CheckCircle2 size={14} /> Livrée</span>
        )}
        {order.customer_phone && (
          <Link
            href={getWhatsAppUrl(`Bonjour ${order.customer_name}, concernant la livraison de votre commande ${order.order_number}`)}
            target="_blank"
            className="p-2 rounded-lg bg-gray-100 hover:bg-[#25D366] hover:text-white text-gray-500 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }: { icon: typeof Truck; label: string; value: string; color: string }) {
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
