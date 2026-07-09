"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Lock, User, MapPin } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { useConfigStore } from "@/stores/config";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/lib/supabase/actions";

const DELIVERY_CITIES = ["Casablanca"];

interface CustomerData { first_name: string; last_name: string; phone: string }
interface AddressData  { city: string; district: string }
type PaymentMethod     = "cash_on_delivery" | "airtel_money" | "moov_money";
interface PaymentData  { method: PaymentMethod; payment_phone: string }

function validate(c: CustomerData, a: AddressData) {
  const e: Record<string, string> = {};
  if (!c.first_name.trim()) e.first_name = "Prénom requis";
  if (!c.last_name.trim())  e.last_name  = "Nom requis";
  if (c.phone.replace(/\s/g, "").length < 8) e.phone = "Numéro invalide (min. 8 chiffres)";
  if (!a.city)            e.city     = "Ville requise";
  if (!a.district.trim()) e.district = "Quartier requis";
  return e;
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-[#020B27]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#B8925A] focus:ring-2 focus:ring-[#B8925A]/10 transition-all placeholder:text-gray-400 bg-white";

export default function CheckoutPage() {
  const router     = useRouter();
  const items      = useCartStore(s => s.items);
  const totalPrice = useCartStore(s => s.totalPrice);
  const clearCart  = useCartStore(s => s.clearCart);
  const DELIVERY_FEE = useConfigStore(s => s.deliveryFee);
  const FREE_DELIVERY_THRESHOLD = useConfigStore(s => s.freeDeliveryThreshold);

  const [submitting,  setSubmitting]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Empêche la redirection « panier vide → /panier » de se déclencher juste après
  // le vidage du panier consécutif à une commande réussie (sinon elle écrase la
  // navigation vers la page de confirmation).
  const orderPlaced = useRef(false);

  const [customer, setCustomer] = useState<CustomerData>({ first_name: "", last_name: "", phone: "" });
  const [address,  setAddress]  = useState<AddressData>({ city: "Casablanca", district: "" });
  // Paiement toujours « à la livraison » (espèces ou mobile money).
  const payment: PaymentData = { method: "cash_on_delivery", payment_phone: "" };

  const subtotal    = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total       = subtotal + deliveryFee;

  useEffect(() => {
    if (items.length === 0 && !orderPlaced.current) router.replace("/panier");
  }, [items.length, router]);

  const handleSubmit = async () => {
    const errs = validate(customer, address);
    if (Object.keys(errs).length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    setSubmitError(null);

    const orderItems = items.map(item => ({
      product_id: item.product.id,
      variant_id: item.variant?.id,
      product_name: item.product.name,
      product_image_url: item.product.main_image_url,
      color: item.variant?.color,
      size: item.variant?.size,
      unit_price: item.product.current_price + (item.variant?.price_adjustment ?? 0),
      quantity: item.quantity,
      total_price: (item.product.current_price + (item.variant?.price_adjustment ?? 0)) * item.quantity,
    }));

    const result = await createOrder({
      customer,
      address,
      payment,
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total,
    });

    if (result.error) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    // On marque la commande comme passée AVANT de vider le panier, pour neutraliser
    // la redirection automatique vers /panier, puis on navigue vers la confirmation.
    orderPlaced.current = true;
    router.push(`/validation-commande?order=${result.order_number}`);
    clearCart();
  };

  if (items.length === 0) return null;

  const orderSummary = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-bold text-[#020B27] mb-4 text-base">Ma commande</h3>
      <div className="space-y-3 mb-5">
        {items.map(item => {
          const unit = item.product.current_price + (item.variant?.price_adjustment ?? 0);
          return (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-11 h-11 bg-gray-50 rounded-xl shrink-0 overflow-hidden">
                {item.product.main_image_url
                  ? <Image src={item.product.main_image_url} alt={item.product.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#B8925A] text-[#020B27] text-[9px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
              </div>
              <p className="flex-1 text-xs font-medium text-[#020B27] line-clamp-2 leading-snug">{item.product.name}</p>
              <p className="text-xs font-bold text-[#020B27] shrink-0">{formatPrice(unit * item.quantity)}</p>
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Sous-total</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Livraison</span>
          <span className={`font-medium ${deliveryFee === 0 ? "text-[#020B27]" : ""}`}>
            {deliveryFee === 0 ? "Gratuite 🎉" : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-100">
          <span className="text-[#020B27]">Total</span>
          <span className="text-[#020B27]">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 lg:pb-12">
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto grid grid-cols-3 items-center">
          <Link href="/panier" className="justify-self-start flex items-center gap-1.5 text-gray-500 hover:text-[#020B27] text-sm transition-colors">
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Panier</span>
          </Link>
          <Link href="/" className="justify-self-center flex items-center shrink-0">
            <Image src="/ryta.png" alt="RYTA" width={220} height={150} priority className="h-10 w-auto object-contain" />
          </Link>
          <span className="justify-self-end flex items-center gap-1 text-gray-400 text-xs">
            <Lock size={11} /> <span className="hidden sm:inline">Sécurisé</span>
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Formulaire unique : coordonnées + adresse */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm space-y-5">
              {/* En-tête */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#B8925A] rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-[#020B27] leading-tight">Vos coordonnées</h2>
                  <p className="text-xs text-gray-500">Livraison &amp; confirmation sur WhatsApp</p>
                </div>
              </div>

              {/* Identité */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Prénom" required error={errors.first_name}>
                  <input className={inputCls} placeholder="Ex : Jean" value={customer.first_name}
                    onChange={e => setCustomer(c => ({ ...c, first_name: e.target.value }))} />
                </Field>
                <Field label="Nom" required error={errors.last_name}>
                  <input className={inputCls} placeholder="Ex : Ndong" value={customer.last_name}
                    onChange={e => setCustomer(c => ({ ...c, last_name: e.target.value }))} />
                </Field>
              </div>
              <Field label="Téléphone WhatsApp" required error={errors.phone}>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <span className="text-base">🇲🇦</span>
                    <span className="text-sm font-semibold text-gray-500 border-r border-gray-200 pr-2">+212</span>
                  </div>
                  <input className={`${inputCls} pl-[4.5rem]`} type="tel" placeholder="612 345 678"
                    value={customer.phone} onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))} />
                </div>
              </Field>

              {/* Séparateur « Adresse de livraison » */}
              <div className="flex items-center gap-2 pt-1">
                <MapPin size={14} className="text-[#B8925A] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Adresse de livraison</span>
                <span className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Adresse */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Ville" required error={errors.city}>
                  <select className={inputCls} value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}>
                    {DELIVERY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Quartier" required error={errors.district}>
                  <input className={inputCls} placeholder="Ex : Derb Ghalef, Maârif…"
                    value={address.district} onChange={e => setAddress(a => ({ ...a, district: e.target.value }))} />
                </Field>
              </div>
            </div>

            {/* Paiement (info) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 bg-green/10 rounded-full flex items-center justify-center shrink-0 text-lg">💵</div>
              <div>
                <p className="font-semibold text-[#020B27] text-sm">Paiement à la livraison</p>
                <p className="text-xs text-gray-500">Espèces ou Mobile Money (sur place)</p>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                Erreur : {submitError}
              </div>
            )}

            {/* Validation — desktop */}
            <div className="hidden lg:block space-y-3">
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full flex items-center justify-center gap-3 bg-[#B8925A] text-white py-4 rounded-2xl font-bold text-base hover:bg-[#9E7A45] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting
                  ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement…</>
                  : <><Lock size={17} /> Confirmer ma commande</>}
              </button>
              <p className="text-center text-xs text-gray-400">
                En confirmant, vous acceptez nos <Link href="/conditions" className="underline">conditions de vente</Link>
              </p>
            </div>
          </div>

          <div className="hidden lg:block lg:sticky lg:top-6 lg:self-start">
            {orderSummary}
          </div>
        </div>
      </div>

      {/* Barre d'action — mobile */}
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-2xl"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-[#B8925A] text-white py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all disabled:opacity-60">
          {submitting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> En cours…</>
            : <><Lock size={16} /> Confirmer · {formatPrice(total)}</>}
        </button>
      </div>
    </div>
  );
}
