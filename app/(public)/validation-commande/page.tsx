"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle, Package, Truck, MapPin,
  MessageCircle, Store, ClipboardList,
  User, CreditCard, ChevronRight,
} from "lucide-react";
import { formatPrice, getWhatsAppUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Espèces à la livraison",
  airtel_money:     "Airtel Money",
  moov_money:       "Moov Money",
};

const TIMELINE = [
  { label: "Commande reçue",          icon: CheckCircle, status: "pending"  },
  { label: "Confirmée",               icon: CheckCircle, status: "confirmed" },
  { label: "En préparation",          icon: Package,     status: "preparing" },
  { label: "Expédiée",               icon: Truck,       status: "shipped"   },
  { label: "En cours de livraison",   icon: MapPin,      status: "out_for_delivery" },
  { label: "Livrée",                 icon: CheckCircle, status: "delivered" },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "shipped", "out_for_delivery", "delivered"];

function ValidationContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const orderNumber  = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) { router.replace("/"); return; }

    async function fetchOrder() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("order_number", orderNumber)
        .single();

      if (error || !data) {
        router.replace("/");
        return;
      }
      setOrder(data as Order);
      setLoading(false);
    }

    fetchOrder();
  }, [orderNumber, router]);

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#020B27] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStepIndex = STATUS_ORDER.indexOf(order.order_status);
  const estimatedDate = order.estimated_delivery_date
    ? new Date(order.estimated_delivery_date).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long",
      })
    : null;
  const createdLabel = new Date(order.created_at).toLocaleString("fr-FR", {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });
  const whatsappUrl = getWhatsAppUrl(
    `Bonjour Assada, j'ai une question concernant ma commande ${order.order_number}.`
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="bg-gradient-to-b from-[#020B27] to-[#0F172A] text-white px-4 pt-10 pb-16 text-center">
        <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={44} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-extrabold mb-1">Commande confirmée !</h1>
        <p className="text-green-100 text-sm">Merci pour votre confiance 🎉</p>
        <div className="mt-5 inline-block bg-white/15 backdrop-blur rounded-2xl px-6 py-3 border border-white/20">
          <p className="text-xs text-green-100 mb-0.5">Numéro de commande</p>
          <p className="font-extrabold text-xl tracking-widest">{order.order_number}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-[#020B27]" />
            </div>
            <div>
              <p className="font-bold text-[#020B27] text-sm">Prochaine étape</p>
              <p className="text-xs text-gray-500">Notre équipe va vous contacter</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Notre équipe va vous contacter sur{" "}
            <strong className="text-[#020B27]">WhatsApp au {order.customer_phone}</strong>{" "}
            pour confirmer votre commande et organiser la livraison.
          </p>
          {estimatedDate && (
            <div className="mt-3 bg-blue-50 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
              📅 Livraison estimée : <strong>{estimatedDate}</strong>
            </div>
          )}
          {order.delivery_fee === 0 && (
            <div className="mt-2 bg-green-50 rounded-xl p-3 text-xs text-green-700 font-medium flex items-center gap-2">
              🎉 Vous bénéficiez de la livraison gratuite !
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-[#020B27] mb-5">Suivi de votre commande</h3>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => {
              const isDone = i <= currentStepIndex;
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isDone ? "bg-[#020B27]" : "bg-gray-100"
                    }`}>
                      <item.icon size={15} className={isDone ? "text-white" : "text-gray-400"} />
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`w-0.5 h-7 ${isDone ? "bg-[#020B27]" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pb-7 pt-1 last:pb-0">
                    <p className={`text-sm font-semibold ${isDone ? "text-[#020B27]" : "text-gray-400"}`}>
                      {item.label}
                    </p>
                    {i === 0 && isDone && (
                      <p className="text-xs text-gray-400 mt-0.5">{createdLabel}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Détails */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-[#020B27] mb-5">Détails de la commande</h3>

          <div className="grid sm:grid-cols-3 gap-4 pb-5 border-b border-gray-50">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <User size={13} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Client</p>
              </div>
              <p className="font-semibold text-[#020B27] text-sm">{order.customer_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.customer_phone}</p>
              {order.customer_email && <p className="text-xs text-gray-500">{order.customer_email}</p>}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Livraison</p>
              </div>
              <p className="font-semibold text-[#020B27] text-sm">{order.delivery_city}, {order.delivery_district}</p>
              {order.delivery_address_details && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{order.delivery_address_details}</p>}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CreditCard size={13} className="text-gray-400" />
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Paiement</p>
              </div>
              <p className="font-semibold text-[#020B27] text-sm">{PAYMENT_LABELS[order.payment_method]}</p>
            </div>
          </div>

          {/* Articles */}
          {order.items && order.items.length > 0 && (
            <div className="py-5 border-b border-gray-50 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 bg-gray-50 rounded-xl shrink-0 overflow-hidden">
                    {item.product_image_url
                      ? <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#020B27] text-sm line-clamp-1">{item.product_name}</p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {item.size  && <span className="text-xs text-gray-400">Taille : {item.size}</span>}
                      {item.color && <span className="text-xs text-gray-400">Couleur : {item.color}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <p className="font-bold text-[#020B27] text-sm shrink-0">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Livraison</span>
              <span className={`font-medium ${order.delivery_fee === 0 ? "text-[#020B27]" : ""}`}>
                {order.delivery_fee === 0 ? "Gratuite" : formatPrice(order.delivery_fee)}
              </span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-3 border-t border-gray-100">
              <span className="text-[#020B27]">Total</span>
              <span className="text-[#020B27]">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-4">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 bg-[#16A34A] text-[#020B27] py-4 rounded-2xl font-bold text-base active:scale-95 transition-all hover:bg-[#15803D]">
            <MessageCircle size={20} />
            Contacter via WhatsApp
          </a>
          <Link href={`/suivi-commande?numero=${order.order_number}`}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#020B27] text-[#020B27] py-4 rounded-2xl font-bold text-base active:scale-95 transition-all hover:bg-gray-50">
            <ClipboardList size={18} />
            Suivre ma commande
            <ChevronRight size={16} />
          </Link>
          <Link href="/boutique"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 py-3.5 rounded-2xl font-medium text-sm active:scale-95 transition-all hover:bg-gray-50">
            <Store size={16} />
            Retourner à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ValidationCommandePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#020B27] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ValidationContent />
    </Suspense>
  );
}
