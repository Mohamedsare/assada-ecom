"use client";

import { useState, useTransition } from "react";
import { Ticket, Plus, Trash2, X } from "lucide-react";
import { adminCreateCoupon, adminToggleCoupon, adminDeleteCoupon } from "@/lib/supabase/actions";
import { formatPrice } from "@/lib/utils";
import type { Coupon } from "@/types";

export default function PromotionsContent({ coupons }: { coupons: Coupon[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Promotions & Coupons</h1>
          <p className="text-text-secondary text-sm mt-0.5">{coupons.length} code(s) promo</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 bg-green hover:bg-[#15803d] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Fermer" : "Nouveau coupon"}
        </button>
      </div>

      {showForm && <CouponForm onDone={() => setShowForm(false)} />}

      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Ticket size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A] mb-1">Aucun coupon</p>
          <p className="text-text-secondary text-sm">Créez votre premier code promo.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
        </div>
      )}
    </div>
  );
}

function CouponForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = (formData: FormData) => {
    startTransition(async () => {
      const res = await adminCreateCoupon(formData);
      if (res?.error) setError(res.error);
      else onDone();
    });
  };

  return (
    <form action={action} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Code" name="code" placeholder="BIENVENUE10" required />
        <Field label="Description" name="description" placeholder="-10% sur la première commande" />
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Type de réduction</label>
          <select name="discount_type" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green">
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (FCFA)</option>
          </select>
        </div>
        <Field label="Valeur" name="discount_value" type="number" placeholder="10" required />
        <Field label="Montant min. de commande (FCFA)" name="min_order_amount" type="number" placeholder="0" />
        <Field label="Utilisations max (vide = illimité)" name="max_uses" type="number" placeholder="100" />
        <Field label="Date d'expiration" name="expires_at" type="date" />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="bg-green hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          {pending ? "Création…" : "Créer le coupon"}
        </button>
        <button type="button" onClick={onDone} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Annuler</button>
      </div>
    </form>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(coupon.is_active);
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  const expired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
  const value = coupon.discount_type === "percentage" ? `-${coupon.discount_value}%` : `-${formatPrice(coupon.discount_value)}`;

  const toggle = () => {
    const next = !active;
    setActive(next);
    startTransition(() => { adminToggleCoupon(coupon.id, next); });
  };
  const remove = () => {
    if (!confirm(`Supprimer le coupon ${coupon.code} ?`)) return;
    setRemoved(true);
    startTransition(() => { adminDeleteCoupon(coupon.id); });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-green/10 rounded-xl flex items-center justify-center"><Ticket size={16} className="text-green" /></div>
          <div>
            <p className="font-bold text-[#0F172A] tracking-wide">{coupon.code}</p>
            <p className="text-lg font-extrabold text-green leading-none">{value}</p>
          </div>
        </div>
        <button onClick={remove} disabled={pending} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer"><Trash2 size={15} /></button>
      </div>

      {coupon.description && <p className="text-xs text-text-secondary mt-2">{coupon.description}</p>}

      <div className="text-[11px] text-text-secondary mt-2 space-y-0.5">
        {(coupon.min_order_amount ?? 0) > 0 && <p>Min. commande : {formatPrice(coupon.min_order_amount!)}</p>}
        <p>Utilisé : {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : " fois"}</p>
        {coupon.expires_at && <p className={expired ? "text-red-500" : ""}>Expire le {new Date(coupon.expires_at).toLocaleDateString("fr-FR")}{expired ? " (expiré)" : ""}</p>}
      </div>

      <button onClick={toggle} disabled={pending} className={`mt-3 w-full text-xs font-semibold py-1.5 rounded-lg transition-colors disabled:opacity-60 ${active ? "bg-green-50 text-green hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
        {active ? "Actif — cliquer pour désactiver" : "Inactif — cliquer pour activer"}
      </button>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input name={name} type={type} placeholder={placeholder} required={required} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
    </div>
  );
}
