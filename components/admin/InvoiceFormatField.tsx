"use client";

import { useState } from "react";
import { FileText, Receipt } from "lucide-react";
import type { InvoiceFormat } from "@/components/admin/Invoice";
import { SHOP_ADDRESS } from "@/lib/constants";

const OPTIONS: { value: InvoiceFormat; label: string; desc: string; icon: typeof FileText }[] = [
  { value: "a4", label: "A4", desc: "Feuille standard", icon: FileText },
  { value: "thermique_80", label: "Thermique 80 mm", desc: "Rouleau ticket 80 mm", icon: Receipt },
  { value: "thermique_58", label: "Thermique 58 mm", desc: "Rouleau ticket 58 mm", icon: Receipt },
];

const SAMPLE_ITEMS = [
  { name: "Parfum Oud Royal 100ml", qty: 1, pu: "450 DH", total: "450 DH" },
  { name: "Crème visage hydratante", qty: 2, pu: "120 DH", total: "240 DH" },
];

/** Sélecteur du format de facture + aperçu en direct. Soumet la valeur via un input caché. */
export default function InvoiceFormatField({ defaultValue }: { defaultValue: string }) {
  const initial: InvoiceFormat =
    defaultValue === "thermique_58" ? "thermique_58"
    : defaultValue === "thermique_80" || defaultValue === "thermique" ? "thermique_80"
    : "a4";
  const [format, setFormat] = useState<InvoiceFormat>(initial);

  return (
    <div>
      <input type="hidden" name="invoice_format" value={format} />
      <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Format de facture</label>

      <div className="grid sm:grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const selected = format === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setFormat(o.value)}
              className={`flex items-center gap-2.5 text-left rounded-xl border p-3 transition-colors ${
                selected ? "border-[#2F9E44] bg-[#2F9E44]/5 ring-1 ring-[#2F9E44]/30" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? "bg-[#2F9E44] text-white" : "bg-gray-100 text-gray-500"}`}>
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#0A2A52]">{o.label}</span>
                <span className="block text-[11px] text-text-secondary">{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Aperçu en direct */}
      <div className="mt-3">
        <p className="text-[11px] font-medium text-text-secondary mb-2">Aperçu</p>
        <div className="rounded-xl border border-gray-200 bg-[#F1F5F9] p-5 flex justify-center overflow-x-auto">
          {format === "a4" ? <A4Preview /> : <ThermalPreview mm={format === "thermique_58" ? 58 : 80} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Aperçus (données d'exemple) ───────────────────────────────────────────── */

function A4Preview() {
  return (
    <div className="bg-white shadow-md text-[#0E2440] w-[210px] min-h-[297px] p-4 text-[7px] leading-tight">
      <div className="flex justify-between items-start border-b-2 border-[#0E2440] pb-2">
        <div>
          <p className="text-[11px] font-extrabold">RYTA</p>
          <p className="text-text-secondary">{SHOP_ADDRESS}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase">Facture</p>
          <p className="text-text-secondary">N° FAC-2026-0001</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div><p className="font-semibold">Facturé à</p><p className="text-text-secondary">Client Exemple</p></div>
        <div><p className="font-semibold">Livraison</p><p className="text-text-secondary">Maârif, Casablanca</p></div>
      </div>
      <table className="w-full mt-2">
        <thead><tr className="bg-[#F1F5F9] text-left"><th className="py-0.5 px-1">Produit</th><th className="px-1 text-center">Qté</th><th className="px-1 text-right">Total</th></tr></thead>
        <tbody>
          {SAMPLE_ITEMS.map((it) => (
            <tr key={it.name} className="border-b border-gray-100">
              <td className="py-0.5 px-1">{it.name}</td>
              <td className="px-1 text-center">{it.qty}</td>
              <td className="px-1 text-right">{it.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-2">
        <div className="w-24">
          <div className="flex justify-between"><span className="text-text-secondary">Sous-total</span><span>690 DH</span></div>
          <div className="flex justify-between"><span className="text-text-secondary">Livraison</span><span>30 DH</span></div>
          <div className="flex justify-between border-t-2 border-[#0E2440] mt-1 pt-1 font-extrabold text-[9px]"><span>Total</span><span>720 DH</span></div>
        </div>
      </div>
      <p className="text-center text-text-secondary mt-4 pt-2 border-t border-gray-100">Merci pour votre confiance ✨</p>
    </div>
  );
}

function ThermalPreview({ mm }: { mm: number }) {
  const width = mm === 58 ? 120 : 165;
  return (
    <div style={{ width }} className="bg-white shadow-md text-[#0E2440] p-2.5 font-mono text-[7px] leading-snug">
      <div className="text-center">
        <p className="text-[10px] font-extrabold">RYTA</p>
        <p>{SHOP_ADDRESS}</p>
        <p>+212 6 12 34 56 78</p>
      </div>
      <Dashed />
      <div className="space-y-0.5">
        <Row l="Facture" v="FAC-2026-0001" />
        <Row l="Date" v="02/07/2026" />
        <Row l="Client" v="Client Exemple" />
      </div>
      <Dashed />
      {SAMPLE_ITEMS.map((it) => (
        <div key={it.name}>
          <p className="font-semibold truncate">{it.name}</p>
          <div className="flex justify-between"><span>{it.qty} x {it.pu}</span><span>{it.total}</span></div>
        </div>
      ))}
      <Dashed />
      <Row l="Sous-total" v="690 DH" />
      <Row l="Livraison" v="30 DH" />
      <div className="flex justify-between font-extrabold text-[9px] border-t border-dashed border-black mt-1 pt-1"><span>TOTAL</span><span>720 DH</span></div>
      <p className="text-center mt-1">Paiement à la livraison</p>
      <Dashed />
      <p className="text-center">Merci pour votre confiance</p>
    </div>
  );
}

function Row({ l, v }: { l: string; v: string }) {
  return <div className="flex justify-between gap-1"><span className="shrink-0">{l}</span><span className="text-right truncate">{v}</span></div>;
}
function Dashed() {
  return <div className="border-t border-dashed border-black my-1.5" />;
}
