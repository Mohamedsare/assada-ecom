"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, FileText, Receipt } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export interface InvoiceShop {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  footer: string;
}

export type InvoiceFormat = "a4" | "thermique_80" | "thermique_58";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
  airtel_money: "Airtel Money",
  moov_money: "Moov Money",
};

/**
 * Facture imprimable d'une commande (formats A4 et thermique 80 mm).
 * Le format initial vient des Réglages boutique ; il reste ajustable avant impression.
 */
export default function Invoice({
  order,
  invoiceNumber,
  shop,
  defaultFormat,
}: {
  order: Order;
  invoiceNumber: string;
  shop: InvoiceShop;
  defaultFormat: InvoiceFormat;
}) {
  const router = useRouter();
  const [format, setFormat] = useState<InvoiceFormat>(defaultFormat);
  const items = order.items ?? [];
  const paymentLabel = PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method;

  const isThermal = format !== "a4";
  const widthMm = format === "thermique_58" ? 58 : 80;

  return (
    <div className="space-y-4">
      {/* Le format thermique impose la largeur de page du rouleau à l'impression. */}
      <style>{`@media print { @page { size: ${isThermal ? `${widthMm}mm auto` : "A4"}; margin: ${isThermal ? "3mm" : "14mm"}; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }`}</style>

      {/* Barre d'actions — masquée à l'impression */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/commandes/${order.id}`)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#020B27]">Facture {invoiceNumber}</h1>
            <p className="text-sm text-[#64748B]">Commande {order.order_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => setFormat("a4")}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${format === "a4" ? "bg-[#0F172A] text-white" : "text-[#020B27] hover:bg-gray-50"}`}
            >
              <FileText size={15} /> A4
            </button>
            <button
              onClick={() => setFormat("thermique_80")}
              className={`flex items-center gap-1.5 px-3 py-2 border-l border-gray-200 transition-colors ${format === "thermique_80" ? "bg-[#0F172A] text-white" : "text-[#020B27] hover:bg-gray-50"}`}
            >
              <Receipt size={15} /> 80 mm
            </button>
            <button
              onClick={() => setFormat("thermique_58")}
              className={`flex items-center gap-1.5 px-3 py-2 border-l border-gray-200 transition-colors ${format === "thermique_58" ? "bg-[#0F172A] text-white" : "text-[#020B27] hover:bg-gray-50"}`}
            >
              <Receipt size={15} /> 58 mm
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-green btn-sweep hover:bg-[#9E7A45] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Printer size={16} /> Imprimer
          </button>
        </div>
      </div>

      {format === "a4" ? (
        <InvoiceA4 order={order} items={items} invoiceNumber={invoiceNumber} shop={shop} paymentLabel={paymentLabel} />
      ) : (
        <InvoiceThermal order={order} items={items} invoiceNumber={invoiceNumber} shop={shop} paymentLabel={paymentLabel} widthMm={widthMm} />
      )}
    </div>
  );
}

/* ─── Format A4 ─────────────────────────────────────────────────────────────── */

function InvoiceA4({
  order, items, invoiceNumber, shop, paymentLabel,
}: {
  order: Order; items: NonNullable<Order["items"]>; invoiceNumber: string; shop: InvoiceShop; paymentLabel: string;
}) {
  return (
    <div className="bg-white text-[#0F172A] mx-auto max-w-[210mm] w-full p-8 print:p-0 rounded-lg border border-gray-100 shadow-sm print:border-0 print:shadow-none">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-6 border-b-2 border-[#0F172A] pb-5">
        <div>
          <p className="text-2xl font-extrabold tracking-tight">{shop.name}</p>
          <p className="text-sm text-[#64748B] mt-1 max-w-xs">{shop.address}</p>
          <p className="text-sm text-[#64748B]">{shop.city}</p>
          <p className="text-sm text-[#64748B] mt-1">{shop.phone} · {shop.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold uppercase tracking-wide">Facture</p>
          <p className="text-sm text-[#64748B] mt-1">N° {invoiceNumber}</p>
          <p className="text-sm text-[#64748B]">Commande {order.order_number}</p>
          <p className="text-sm text-[#64748B]">Date : {formatDate(order.created_at)}</p>
        </div>
      </div>

      {/* Client */}
      <div className="grid grid-cols-2 gap-6 mt-5">
        <div>
          <p className="text-xs font-semibold uppercase text-[#64748B] mb-1">Facturé à</p>
          <p className="text-sm font-semibold">{order.customer_name}</p>
          <p className="text-sm text-[#64748B]">{order.customer_phone}</p>
          {order.customer_email && <p className="text-sm text-[#64748B]">{order.customer_email}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#64748B] mb-1">Livraison</p>
          <p className="text-sm">{order.delivery_district}, {order.delivery_city}</p>
          {order.delivery_address_details && <p className="text-sm text-[#64748B]">{order.delivery_address_details}</p>}
          {order.delivery_landmark && <p className="text-sm text-[#64748B] italic">Repère : {order.delivery_landmark}</p>}
        </div>
      </div>

      {/* Articles */}
      <table className="w-full mt-6 text-sm border-collapse">
        <thead>
          <tr className="bg-[#F1F5F9] text-left">
            <th className="py-2 px-3 font-semibold">Produit</th>
            <th className="py-2 px-3 font-semibold text-center w-16">Qté</th>
            <th className="py-2 px-3 font-semibold text-right w-28">Prix unit.</th>
            <th className="py-2 px-3 font-semibold text-right w-28">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2 px-3">
                {item.product_name}
                {(item.color || item.size) && (
                  <span className="text-[#64748B]"> — {[item.color, item.size].filter(Boolean).join(" / ")}</span>
                )}
              </td>
              <td className="py-2 px-3 text-center">{item.quantity}</td>
              <td className="py-2 px-3 text-right">{formatPrice(item.unit_price)}</td>
              <td className="py-2 px-3 text-right font-medium">{formatPrice(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totaux */}
      <div className="flex justify-end mt-4">
        <div className="w-64 text-sm space-y-1.5">
          <Line label="Sous-total" value={formatPrice(order.subtotal)} />
          <Line label="Frais de livraison" value={order.delivery_fee ? formatPrice(order.delivery_fee) : "Gratuite"} />
          {order.discount_amount > 0 && <Line label="Réduction" value={`− ${formatPrice(order.discount_amount)}`} />}
          <div className="flex items-center justify-between border-t-2 border-[#0F172A] pt-2 mt-2">
            <span className="font-bold">Total à payer</span>
            <span className="font-extrabold text-lg">{formatPrice(order.total_amount)}</span>
          </div>
          <p className="text-xs text-[#64748B] text-right">Mode de paiement : {paymentLabel}</p>
        </div>
      </div>

      {order.customer_note && (
        <div className="mt-5 text-sm">
          <p className="text-xs font-semibold uppercase text-[#64748B] mb-1">Note du client</p>
          <p>{order.customer_note}</p>
        </div>
      )}

      <p className="text-center text-sm text-[#64748B] mt-8 pt-5 border-t border-gray-100">{shop.footer}</p>
    </div>
  );
}

/* ─── Format thermique (rouleau 80 mm ou 58 mm) ─────────────────────────────── */

function InvoiceThermal({
  order, items, invoiceNumber, shop, paymentLabel, widthMm,
}: {
  order: Order; items: NonNullable<Order["items"]>; invoiceNumber: string; shop: InvoiceShop; paymentLabel: string; widthMm: number;
}) {
  return (
    <div
      style={{ width: `${widthMm}mm` }}
      className="bg-white text-[#0F172A] mx-auto p-3 rounded-lg border border-gray-100 shadow-sm print:border-0 print:shadow-none print:rounded-none font-mono text-[11px] leading-tight"
    >
      <div className="text-center">
        <p className="text-base font-extrabold tracking-tight">{shop.name}</p>
        <p>{shop.address}</p>
        <p>{shop.city}</p>
        <p>{shop.phone}</p>
      </div>

      <Dashed />
      <div className="space-y-0.5">
        <ThermalRow label="Facture" value={invoiceNumber} />
        <ThermalRow label="Commande" value={order.order_number} />
        <ThermalRow label="Date" value={formatDate(order.created_at)} />
        <ThermalRow label="Client" value={order.customer_name} />
        <ThermalRow label="Tél" value={order.customer_phone} />
        <ThermalRow label="Quartier" value={order.delivery_district} />
        {order.delivery_address_details && <ThermalRow label="Adresse" value={order.delivery_address_details} />}
      </div>

      <Dashed />
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id}>
            <p className="font-semibold">{item.product_name}</p>
            {(item.color || item.size) && (
              <p className="text-[10px]">{[item.color, item.size].filter(Boolean).join(" / ")}</p>
            )}
            <div className="flex justify-between">
              <span>{item.quantity} x {formatPrice(item.unit_price)}</span>
              <span>{formatPrice(item.total_price)}</span>
            </div>
          </div>
        ))}
      </div>

      <Dashed />
      <div className="space-y-0.5">
        <ThermalRow label="Sous-total" value={formatPrice(order.subtotal)} />
        <ThermalRow label="Livraison" value={order.delivery_fee ? formatPrice(order.delivery_fee) : "Gratuite"} />
        {order.discount_amount > 0 && <ThermalRow label="Réduction" value={`- ${formatPrice(order.discount_amount)}`} />}
        <div className="flex justify-between font-extrabold text-[13px] border-t border-dashed border-black pt-1 mt-1">
          <span>TOTAL</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
        <p className="text-center mt-1">{paymentLabel}</p>
      </div>

      {order.customer_note && (
        <>
          <Dashed />
          <p className="text-[10px]">Note : {order.customer_note}</p>
        </>
      )}

      <Dashed />
      <p className="text-center">{shop.footer}</p>
    </div>
  );
}

/* ─── Sous-composants ───────────────────────────────────────────────────────── */

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#64748B]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ThermalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0">{label}</span>
      <span className="text-right break-words">{value}</span>
    </div>
  );
}

function Dashed() {
  return <div className="border-t border-dashed border-black my-2" />;
}
