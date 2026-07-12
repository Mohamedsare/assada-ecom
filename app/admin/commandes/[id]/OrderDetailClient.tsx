"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MessageCircle, Printer, MapPin, Phone, Mail, User,
  Package, CreditCard, Save, Loader2, FileText, Truck, Radio,
} from "lucide-react";
import { formatPrice, formatDate, getClientWhatsAppUrl } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_CHANNEL_LABELS } from "@/lib/constants";
import {
  adminUpdateOrderStatus, adminUpdatePaymentStatus, adminUpdateOrderNote,
  adminAssignOrderAgent, adminUpdateOrderChannel,
} from "@/lib/supabase/actions";
import type { Order, DeliveryAgent, OrderChannel } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-blue-100 text-blue-700",
  preparing:        "bg-purple-100 text-purple-700",
  shipped:          "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:        "bg-green-100 text-[#0A2A52]",
  cancelled:        "bg-red-100 text-red-700",
  returned:         "bg-gray-100 text-gray-700",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Espèces à la livraison",
  airtel_money:     "Airtel Money",
  moov_money:       "Moov Money",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending:          "En attente",
  paid:             "Payé",
  failed:           "Échoué",
  refunded:         "Remboursé",
  cash_on_delivery: "À la livraison",
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700",
  paid:             "bg-green-100 text-[#0A2A52]",
  failed:           "bg-red-100 text-red-700",
  refunded:         "bg-gray-100 text-gray-700",
  cash_on_delivery: "bg-blue-100 text-blue-700",
};

export default function OrderDetailClient({ order, agents = [] }: { order: Order; agents?: DeliveryAgent[] }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.order_status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [note, setNote] = useState(order.admin_note ?? "");
  const [agentId, setAgentId] = useState(order.delivery_agent_id ?? "");
  const [channel, setChannel] = useState<OrderChannel>(order.channel ?? "site");
  const [pending, startTransition] = useTransition();
  const [noteSaved, setNoteSaved] = useState(false);

  const changeAgent = (value: string) => {
    setAgentId(value);
    startTransition(async () => { await adminAssignOrderAgent(order.id, value); router.refresh(); });
  };
  const changeChannel = (value: string) => {
    setChannel(value as OrderChannel);
    startTransition(async () => { await adminUpdateOrderChannel(order.id, value); router.refresh(); });
  };

  const changeStatus = (value: string) => {
    setStatus(value as Order["order_status"]);
    startTransition(async () => {
      await adminUpdateOrderStatus(order.id, value);
      router.refresh();
    });
  };

  const changePayment = (value: string) => {
    setPaymentStatus(value as Order["payment_status"]);
    startTransition(async () => {
      await adminUpdatePaymentStatus(order.id, value);
      router.refresh();
    });
  };

  const saveNote = () => {
    setNoteSaved(false);
    startTransition(async () => {
      await adminUpdateOrderNote(order.id, note);
      setNoteSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/commandes")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A2A52] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A2A52]">{order.order_number}</h1>
            <p className="text-sm text-[#64748B] mt-0.5">Passée le {formatDate(order.created_at)}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[status]}`}>
            {ORDER_STATUS_LABELS[status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={getClientWhatsAppUrl(order.customer_phone, `Bonjour ${order.customer_name}, concernant votre commande ${order.order_number} chez RYTA.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 text-[#0A2A52] text-sm font-medium px-4 py-2.5 rounded-lg hover:border-[#2F9E44] hover:text-[#2F9E44] transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp client
          </Link>
          <Link
            href={`/admin/commandes/${order.id}/facture`}
            className="flex items-center gap-2 border border-gray-200 text-[#0A2A52] text-sm font-medium px-4 py-2.5 rounded-lg hover:border-[#2F9E44] hover:text-[#2F9E44] transition-colors"
          >
            <FileText size={16} /> Générer la facture
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#0E2440] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            <Printer size={16} /> Imprimer le reçu
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <Card title={`Articles (${order.items?.length ?? 0})`} icon={<Package size={16} />}>
            <div className="divide-y divide-gray-50 -my-2">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.product_image_url ? (
                      <Image src={item.product_image_url} alt={item.product_name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <Package size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A2A52] truncate">{item.product_name}</p>
                    <p className="text-xs text-[#64748B]">
                      {[item.color, item.size].filter(Boolean).join(" • ")}
                      {(item.color || item.size) && " — "}
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#0A2A52] whitespace-nowrap">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5 text-sm">
              <Row label="Sous-total" value={formatPrice(order.subtotal)} />
              <Row label="Livraison" value={order.delivery_fee ? formatPrice(order.delivery_fee) : "Gratuite"} />
              {order.discount_amount > 0 && <Row label="Réduction" value={`− ${formatPrice(order.discount_amount)}`} />}
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                <span className="font-semibold text-[#0A2A52]">Total</span>
                <span className="font-bold text-lg text-[#0A2A52]">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </Card>

          {/* Note admin */}
          <Card title="Note interne (admin)">
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }}
              rows={3}
              placeholder="Note visible uniquement par l'équipe…"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={saveNote}
                disabled={pending}
                className="flex items-center gap-2 bg-green btn-sweep hover:bg-[#237A34] disabled:opacity-60 text-[#0A2A52] text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer la note
              </button>
              {noteSaved && <span className="text-xs text-green font-medium">Enregistrée ✓</span>}
            </div>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Gestion statut */}
          <Card title="Statut de la commande" className="print:hidden">
            <select
              value={status}
              disabled={pending}
              onChange={(e) => changeStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white disabled:opacity-60"
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Card>

          {/* Livraison — livreur assigné */}
          <Card title="Livreur assigné" icon={<Truck size={16} />} className="print:hidden">
            <select
              value={agentId}
              disabled={pending}
              onChange={(e) => changeAgent(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white disabled:opacity-60"
            >
              <option value="">Aucun livreur</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}{a.zones ? ` — ${a.zones}` : ""}</option>)}
            </select>
            {agents.length === 0 && (
              <p className="text-xs text-[#64748B]">Ajoutez des livreurs dans le menu « Livreurs » pour pouvoir les assigner.</p>
            )}
          </Card>

          {/* Canal de la commande */}
          <Card title="Canal de la commande" icon={<Radio size={16} />} className="print:hidden">
            <select
              value={channel}
              disabled={pending}
              onChange={(e) => changeChannel(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white disabled:opacity-60"
            >
              {Object.entries(ORDER_CHANNEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Card>

          {/* Paiement */}
          <Card title="Paiement" icon={<CreditCard size={16} />}>
            <Row label="Méthode" value={PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method} />
            <div>
              <p className="text-xs text-[#64748B] mb-1.5">Statut du paiement</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${PAYMENT_STATUS_COLOR[paymentStatus]}`}>
                {PAYMENT_STATUS_LABELS[paymentStatus]}
              </span>
              <select
                value={paymentStatus}
                disabled={pending}
                onChange={(e) => changePayment(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white disabled:opacity-60 print:hidden"
              >
                {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </Card>

          {/* Client */}
          <Card title="Client" icon={<User size={16} />}>
            <InfoLine icon={<User size={13} />} value={order.customer_name} />
            <InfoLine icon={<Phone size={13} />} value={order.customer_phone} />
            {order.customer_email && <InfoLine icon={<Mail size={13} />} value={order.customer_email} />}
          </Card>

          {/* Livraison */}
          <Card title="Adresse de livraison" icon={<MapPin size={16} />}>
            <p className="text-sm text-[#0A2A52] font-medium">{order.delivery_city}</p>
            <p className="text-sm text-[#64748B]">{order.delivery_district}</p>
            {order.delivery_address_details && <p className="text-sm text-[#64748B]">{order.delivery_address_details}</p>}
            {order.delivery_landmark && <p className="text-xs text-[#64748B] italic">Repère : {order.delivery_landmark}</p>}
            {order.estimated_delivery_date && (
              <p className="text-xs text-[#64748B] pt-1 border-t border-gray-50 mt-1">
                Livraison estimée : <span className="font-medium text-[#0A2A52]">{order.estimated_delivery_date}</span>
              </p>
            )}
            {order.customer_note && (
              <div className="pt-2 border-t border-gray-50 mt-1">
                <p className="text-xs text-[#64748B] mb-0.5">Note du client :</p>
                <p className="text-sm text-[#0A2A52]">{order.customer_note}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children, className = "" }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-100 shadow-sm p-5 ${className}`}>
      <h2 className="font-semibold text-[#0A2A52] mb-4 flex items-center gap-2">
        {icon && <span className="text-green">{icon}</span>}{title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#64748B]">{label}</span>
      <span className="text-[#0A2A52] font-medium">{value}</span>
    </div>
  );
}

function InfoLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#0A2A52]">
      <span className="text-gray-400">{icon}</span>{value}
    </div>
  );
}
