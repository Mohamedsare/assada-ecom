"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, CheckCircle2, Truck, MapPin, Clock, MessageCircle, HelpCircle, AlertTriangle, Phone, X } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getWhatsAppUrl, formatPrice, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types";

const TRACKING_STEPS = [
  { status: "pending",          label: "Commande reçue",          icon: CheckCircle2 },
  { status: "confirmed",        label: "Commande confirmée",       icon: CheckCircle2 },
  { status: "preparing",        label: "En préparation",           icon: Package },
  { status: "shipped",          label: "Expédiée",                 icon: Truck },
  { status: "out_for_delivery", label: "En cours de livraison",    icon: MapPin },
  { status: "delivered",        label: "Livrée",                   icon: CheckCircle2 },
];

const STATUS_ORDER = ["pending", "confirmed", "preparing", "shipped", "out_for_delivery", "delivered"];

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-50 text-yellow-700",
  confirmed:        "bg-blue-50 text-blue-700",
  preparing:        "bg-purple-50 text-purple-700",
  shipped:          "bg-indigo-50 text-indigo-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered:        "bg-green-50 text-green-700",
  cancelled:        "bg-red-50 text-red-700",
  returned:         "bg-gray-50 text-gray-700",
};

function SuiviForm() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get("numero") || "";

  const [searchType, setSearchType] = useState<"number" | "email">("number");
  const [query, setQuery] = useState(initialNumber);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    const supabase = createClient();
    let q = supabase
      .from("orders")
      .select("*, items:order_items(*)");

    if (searchType === "number") {
      q = q.eq("order_number", query.trim().toUpperCase());
    } else {
      q = q.eq("customer_email", query.trim().toLowerCase());
    }

    const { data, error: err } = await q.maybeSingle();

    if (err || !data) {
      setError("Aucune commande trouvée. Vérifiez votre numéro de commande ou votre email.");
    } else {
      setOrder(data as Order);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialNumber) doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStep = order ? STATUS_ORDER.indexOf(order.order_status) : -1;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-night text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={32} className="text-green-light" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Suivi de votre commande</h1>
          <p className="text-gray-300">Suivez l&apos;état de votre commande à chaque étape de la livraison</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Formulaire de recherche */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-[#020B27] mb-4">Rechercher votre commande</h2>

          <div className="flex gap-2 mb-4">
            {[
              { value: "number", label: "N° de commande" },
              { value: "email",  label: "Email" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSearchType(opt.value as "number" | "email"); setQuery(""); setOrder(null); setError(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchType === opt.value
                    ? "bg-green text-white"
                    : "border border-gray-200 text-gray-600 hover:border-green"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type={searchType === "email" ? "email" : "text"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder={searchType === "number" ? "Ex: ASSADA-2025-4321" : "votre@email.com"}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green transition-colors"
              />
              {query && (
                <button onClick={() => { setQuery(""); setOrder(null); setError(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={doSearch}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-green text-[#020B27] px-5 py-3 rounded-xl font-medium hover:bg-[#15803D] transition-colors disabled:opacity-60"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Search size={16} />}
              Suivre
            </button>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="mt-4 border-t border-gray-50 pt-4 text-center">
            <Link href="/connexion" className="text-sm text-text-secondary hover:text-green transition-colors">
              Connectez-vous pour voir toutes vos commandes →
            </Link>
          </div>
        </div>

        {/* Résultat */}
        {order && (
          <div className="space-y-6">
            {/* Résumé commande */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-text-secondary">Commande</p>
                  <h3 className="text-xl font-bold text-[#020B27]">{order.order_number}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLOR[order.order_status] ?? "bg-gray-50 text-gray-700"}`}>
                  {ORDER_STATUS_LABELS[order.order_status]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Client</p>
                  <p className="font-medium text-[#020B27]">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Livraison</p>
                  <p className="font-medium text-[#020B27]">{order.delivery_district}, {order.delivery_city}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Total</p>
                  <p className="font-bold text-green">{formatPrice(order.total_amount)}</p>
                </div>
                {order.estimated_delivery_date && (
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-text-secondary flex items-center gap-1">
                      <Clock size={13} className="text-orange-500" />
                      Livraison estimée :{" "}
                      <strong className="text-[#020B27]">
                        {new Date(order.estimated_delivery_date).toLocaleDateString("fr-FR", {
                          weekday: "long", day: "numeric", month: "long",
                        })}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {order.order_status !== "cancelled" && order.order_status !== "returned" ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#020B27] mb-6">Suivi de votre commande</h3>
                <div className="relative">
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                  {currentStep >= 0 && (
                    <div
                      className="absolute left-5 top-5 w-0.5 bg-green transition-all"
                      style={{ height: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
                    />
                  )}
                  <div className="space-y-6">
                    {TRACKING_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isDone = index <= currentStep;
                      const isCurrent = index === currentStep;
                      return (
                        <div key={step.status} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                            isDone ? "bg-green text-white" : "bg-gray-100 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-green/20" : ""}`}>
                            <Icon size={18} />
                          </div>
                          <div className="pt-2">
                            <p className={`font-medium ${isDone ? "text-[#020B27]" : "text-gray-400"}`}>
                              {step.label}
                            </p>
                            {isCurrent && <p className="text-sm text-green mt-0.5">En cours...</p>}
                            {isDone && !isCurrent && <p className="text-sm text-text-secondary mt-0.5">Terminé</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
                <p className="font-bold text-red-700 mb-1">
                  {order.order_status === "cancelled" ? "Commande annulée" : "Commande retournée"}
                </p>
                <p className="text-sm text-red-600">
                  Contactez-nous sur WhatsApp pour plus d&apos;informations.
                </p>
              </div>
            )}

            {/* Aide */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#020B27] mb-4">Besoin d&apos;aide ?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: MessageCircle, label: "WhatsApp", desc: "Réponse rapide", href: getWhatsAppUrl(`Bonjour Assada, j'ai une question concernant ma commande ${order.order_number}.`), color: "text-green-600 bg-green-50" },
                  { icon: Phone, label: "Support", desc: "+212 00 00 00 00", href: "tel:+21200000000", color: "text-blue-600 bg-blue-50" },
                  { icon: HelpCircle, label: "FAQ", desc: "Questions fréquentes", href: "/faq", color: "text-purple-600 bg-purple-50" },
                  { icon: AlertTriangle, label: "Signaler", desc: "Un problème", href: "/contact", color: "text-orange-600 bg-orange-50" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.label} href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-green transition-colors text-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-[#020B27] text-sm">{item.label}</p>
                        <p className="text-xs text-text-secondary">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuiviContent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" /></div>}>
      <SuiviForm />
    </Suspense>
  );
}
