"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Truck, MapPin, MessageCircle, Package, CheckCircle2, Search } from "lucide-react";
import { adminUpdateOrderStatus } from "@/lib/supabase/actions";
import { getClientWhatsAppUrl, formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@/types";

// Étapes de progression d'une livraison
const FLOW = ["confirmed", "preparing", "shipped", "out_for_delivery", "delivered"] as const;
const ACTIVE_STATUSES = ["confirmed", "preparing", "shipped", "out_for_delivery"];

export default function LivraisonsContent({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<"active" | "delivered">("active");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const active = useMemo(() => orders.filter((o) => ACTIVE_STATUSES.includes(o.order_status)), [orders]);
  const delivered = useMemo(() => orders.filter((o) => o.order_status === "delivered"), [orders]);

  const cities = useMemo(
    () => Array.from(new Set(orders.map((o) => o.delivery_city).filter(Boolean))).sort(),
    [orders],
  );

  const list = useMemo(() => {
    const base = tab === "active" ? active : delivered;
    const q = search.trim().toLowerCase();
    return base.filter((o) => {
      if (city && o.delivery_city !== city) return false;
      if (q && !o.order_number.toLowerCase().includes(q) &&
          !o.customer_name.toLowerCase().includes(q) &&
          !(o.delivery_district ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tab, active, delivered, search, city]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A2A52]">Livraisons</h1>
        <p className="text-text-secondary text-sm mt-0.5">Suivez et faites avancer les livraisons en cours</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={Package} label="À préparer" value={String(orders.filter((o) => o.order_status === "confirmed" || o.order_status === "preparing").length)} color="text-blue-600 bg-blue-50" />
        <Kpi icon={Truck} label="En transit" value={String(orders.filter((o) => o.order_status === "shipped" || o.order_status === "out_for_delivery").length)} color="text-orange-600 bg-orange-50" />
        <Kpi icon={CheckCircle2} label="Livrées" value={String(delivered.length)} color="text-green bg-green-50" />
        <Kpi icon={Truck} label="En cours" value={String(active.length)} color="text-purple-600 bg-purple-50" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {([["active", `En cours (${active.length})`], ["delivered", `Livrées (${delivered.length})`]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${tab === k ? "bg-night text-white" : "bg-white border border-gray-200 text-text-secondary hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-44">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° commande, client, quartier…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-green transition-colors"
          />
        </div>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green bg-white">
          <option value="">Toutes les villes</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Truck size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0A2A52]">Aucune livraison {tab === "active" ? "en cours" : "terminée"}</p>
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
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <Link href={`/admin/commandes/${order.id}`} className="text-sm font-bold text-[#0A2A52] hover:text-green transition-colors">{order.order_number}</Link>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{ORDER_STATUS_LABELS[status] ?? status}</span>
      </div>

      <p className="text-sm text-[#0A2A52]">{order.customer_name}</p>
      <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
        <MapPin size={12} /> {order.delivery_district}, {order.delivery_city}
      </p>
      {order.estimated_delivery_date && (
        <p className="text-xs text-text-secondary mt-0.5">Estimée : {order.estimated_delivery_date}</p>
      )}
      <p className="text-sm font-bold text-green mt-1">{formatPrice(order.total_amount)}</p>

      {/* Progression */}
      <div className="flex items-center gap-1 mt-3">
        {FLOW.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= stepIndex ? "bg-green" : "bg-gray-100"}`} title={ORDER_STATUS_LABELS[s]} />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        {nextStatus ? (
          <button onClick={advance} disabled={pending} className="flex-1 text-xs font-semibold bg-green text-[#0A2A52] px-3 py-2 rounded-lg btn-sweep hover:bg-[#237A34] disabled:opacity-60 transition-colors">
            {pending ? "…" : `Passer à : ${ORDER_STATUS_LABELS[nextStatus]}`}
          </button>
        ) : (
          <span className="flex-1 text-xs font-medium text-green flex items-center gap-1"><CheckCircle2 size={14} /> Livrée</span>
        )}
        {order.customer_phone && (
          <Link
            href={getClientWhatsAppUrl(order.customer_phone, `Bonjour ${order.customer_name}, concernant la livraison de votre commande ${order.order_number}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-gray-100 hover:bg-[#2F9E44] hover:text-white text-gray-500 transition-colors"
            title="WhatsApp client"
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
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-[#0A2A52] leading-none truncate">{value}</p>
        <p className="text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  );
}
