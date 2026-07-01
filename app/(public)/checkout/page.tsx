"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Check, ChevronRight, ChevronLeft, Lock,
  User, MapPin, CreditCard, ClipboardCheck,
  Phone, Ticket, X,
} from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { useConfigStore } from "@/stores/config";
import { formatPrice } from "@/lib/utils";
import { createOrder, validateCoupon } from "@/lib/supabase/actions";

const STEPS = [
  { id: 1, label: "Client",   icon: User },
  { id: 2, label: "Adresse",  icon: MapPin },
  { id: 3, label: "Paiement", icon: CreditCard },
  { id: 4, label: "Récap",    icon: ClipboardCheck },
];

const GABON_CITIES = [
  "Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda",
  "Mouila", "Lambaréné", "Tchibanga", "Koulamoutou", "Makokou",
];

const PAYMENT_OPTIONS = [
  {
    id: "cash_on_delivery" as const,
    label: "Espèces à la livraison",
    description: "Payez en cash à la réception de votre commande",
    image: "/paiments/paiement-livraison.jpeg",
  },
  {
    id: "airtel_money" as const,
    label: "Airtel Money",
    description: "Paiement mobile sécurisé via Airtel Money",
    image: "/paiments/airtel-money.jpeg",
  },
  {
    id: "moov_money" as const,
    label: "Moov Money",
    description: "Paiement mobile sécurisé via Moov Money",
    image: "/paiments/moov-money.jpeg",
  },
];

interface CustomerData { first_name: string; last_name: string; phone: string; email: string }
interface AddressData  { city: string; district: string; address_details: string; landmark: string }
type PaymentMethod     = "cash_on_delivery" | "airtel_money" | "moov_money";
interface PaymentData  { method: PaymentMethod; payment_phone: string }

function validate(step: number, c: CustomerData, a: AddressData, p: PaymentData) {
  const e: Record<string, string> = {};
  if (step === 1) {
    if (!c.first_name.trim()) e.first_name = "Prénom requis";
    if (!c.last_name.trim())  e.last_name  = "Nom requis";
    if (c.phone.replace(/\s/g, "").length < 8) e.phone = "Numéro invalide (min. 8 chiffres)";
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = "Email invalide";
  }
  if (step === 2) {
    if (!a.city)                              e.city            = "Ville requise";
    if (!a.district.trim())                   e.district        = "Quartier requis";
    if (a.address_details.trim().length < 5) e.address_details = "Adresse trop courte";
  }
  if (step === 3) {
    if ((p.method === "airtel_money" || p.method === "moov_money") && !p.payment_phone.trim())
      e.payment_phone = "Numéro de paiement requis";
  }
  return e;
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-[#0F172A]">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all placeholder:text-gray-400 bg-white";

export default function CheckoutPage() {
  const router    = useRouter();
  const items     = useCartStore(s => s.items);
  const totalPrice = useCartStore(s => s.totalPrice);
  const totalItems = useCartStore(s => s.totalItems);
  const clearCart  = useCartStore(s => s.clearCart);
  const DELIVERY_FEE = useConfigStore(s => s.deliveryFee);
  const FREE_DELIVERY_THRESHOLD = useConfigStore(s => s.freeDeliveryThreshold);

  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerData>({ first_name: "", last_name: "", phone: "", email: "" });
  const [address,  setAddress]  = useState<AddressData>({ city: "Libreville", district: "", address_details: "", landmark: "" });
  const [payment,  setPayment]  = useState<PaymentData>({ method: "cash_on_delivery", payment_phone: "" });

  const [couponInput, setCouponInput]   = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError]   = useState<string | null>(null);
  const [couponPending, startCoupon]    = useTransition();

  const subtotal    = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const discount    = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const total       = Math.max(0, subtotal + deliveryFee - discount);

  const applyCoupon = () => {
    setCouponError(null);
    startCoupon(async () => {
      const res = await validateCoupon(couponInput, subtotal);
      if (!res.ok) { setCouponError(res.error); setAppliedCoupon(null); }
      else { setAppliedCoupon({ code: res.code, discount: res.discount }); setCouponInput(res.code); }
    });
  };
  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(""); setCouponError(null); };

  useEffect(() => {
    if (items.length === 0) router.replace("/panier");
  }, [items.length, router]);

  const goNext = () => {
    const errs = validate(step, customer, address, payment);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setErrors({});
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
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
      discount,
      coupon_code: appliedCoupon?.code ?? null,
    });

    if (result.error) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push(`/validation-commande?order=${result.order_number}`);
  };

  const paymentLabel = PAYMENT_OPTIONS.find(p => p.id === payment.method)?.label ?? "";

  if (items.length === 0) return null;

  const orderSummary = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-bold text-[#0F172A] mb-4 text-base">Ma commande</h3>
      <div className="space-y-3 mb-5">
        {items.map(item => {
          const unit = item.product.current_price + (item.variant?.price_adjustment ?? 0);
          return (
            <div key={item.id} className="flex gap-3 items-center">
              <div className="relative w-11 h-11 bg-gray-50 rounded-xl shrink-0 overflow-hidden">
                {item.product.main_image_url
                  ? <Image src={item.product.main_image_url} alt={item.product.name} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#16A34A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
              </div>
              <p className="flex-1 text-xs font-medium text-[#0F172A] line-clamp-2 leading-snug">{item.product.name}</p>
              <p className="text-xs font-bold text-[#0F172A] shrink-0">{formatPrice(unit * item.quantity)}</p>
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
          <span className={`font-medium ${deliveryFee === 0 ? "text-[#16A34A]" : ""}`}>
            {deliveryFee === 0 ? "Gratuite 🎉" : formatPrice(deliveryFee)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Réduction{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
            <span className="font-medium text-[#16A34A]">− {formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-100">
          <span className="text-[#0F172A]">Total</span>
          <span className="text-[#16A34A]">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 lg:pb-12">
      <div className="bg-[#020B27] text-white px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/panier" className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Panier
          </Link>
          <span className="font-bold text-sm">Finaliser ma commande</span>
          <span className="flex items-center gap-1 text-gray-400 text-xs">
            <Lock size={11} /> Sécurisé
          </span>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.id  ? "bg-[#16A34A] text-white" :
                    step === s.id ? "bg-[#020B27] text-white" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {step > s.id ? <Check size={13} /> : s.id}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold hidden sm:block transition-colors ${
                    step === s.id ? "text-[#020B27]" : step > s.id ? "text-[#16A34A]" : "text-gray-400"
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${step > s.id ? "bg-[#16A34A]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#020B27] rounded-full flex items-center justify-center shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0F172A]">Vos informations</h2>
                    <p className="text-xs text-gray-500">Pour confirmer votre commande sur WhatsApp</p>
                  </div>
                </div>
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
                      <span className="text-base">🇬🇦</span>
                      <span className="text-sm font-semibold text-gray-500 border-r border-gray-200 pr-2">+241</span>
                    </div>
                    <input className={`${inputCls} pl-[4.5rem]`} type="tel" placeholder="62 57 37 48"
                      value={customer.phone} onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))} />
                  </div>
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className={inputCls} type="email" placeholder="votre@email.com (optionnel)"
                    value={customer.email} onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#020B27] rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0F172A]">Adresse de livraison</h2>
                    <p className="text-xs text-gray-500">Où souhaitez-vous être livré ?</p>
                  </div>
                </div>
                <Field label="Ville" required error={errors.city}>
                  <select className={inputCls} value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}>
                    {GABON_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Quartier" required error={errors.district}>
                  <input className={inputCls} placeholder="Ex : Akanda, Lalala, PK8…"
                    value={address.district} onChange={e => setAddress(a => ({ ...a, district: e.target.value }))} />
                </Field>
                <Field label="Adresse détaillée" required error={errors.address_details}>
                  <textarea className={`${inputCls} resize-none`} rows={3}
                    placeholder="Ex : Rue des Cocotiers, immeuble Soleil, 2ème étage…"
                    value={address.address_details} onChange={e => setAddress(a => ({ ...a, address_details: e.target.value }))} />
                </Field>
                <Field label="Repère / Indications" error={errors.landmark}>
                  <input className={inputCls} placeholder="Ex : En face de la pharmacie Total…"
                    value={address.landmark} onChange={e => setAddress(a => ({ ...a, landmark: e.target.value }))} />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#020B27] rounded-full flex items-center justify-center shrink-0">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0F172A]">Mode de paiement</h2>
                    <p className="text-xs text-gray-500">Choisissez comment vous souhaitez payer</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map(opt => {
                    const selected = payment.method === opt.id;
                    return (
                      <button key={opt.id} onClick={() => setPayment(p => ({ ...p, method: opt.id, payment_phone: "" }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                          selected ? "border-[#16A34A] bg-green-50/60" : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}>
                        <div className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border bg-white transition-colors ${selected ? "border-[#16A34A]" : "border-gray-200"}`}>
                          <Image src={opt.image} alt={opt.label} fill className="object-contain p-1" sizes="44px" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-[#0F172A] text-sm">{opt.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected ? "border-[#16A34A] bg-[#16A34A]" : "border-gray-300"
                        }`}>
                          {selected && <Check size={11} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {(payment.method === "airtel_money" || payment.method === "moov_money") && (
                  <Field
                    label={`Numéro ${payment.method === "airtel_money" ? "Airtel Money" : "Moov Money"}`}
                    required error={errors.payment_phone}
                  >
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input className={`${inputCls} pl-10`} type="tel"
                        placeholder="Numéro de paiement mobile"
                        value={payment.payment_phone}
                        onChange={e => setPayment(p => ({ ...p, payment_phone: e.target.value }))} />
                    </div>
                  </Field>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm divide-y divide-gray-50">
                  <h2 className="font-bold text-[#0F172A] pb-4">Vérifiez votre commande</h2>
                  {[
                    { icon: User, title: "Client", stepBack: 1,
                      lines: [`${customer.first_name} ${customer.last_name}`, `+241 ${customer.phone}`, customer.email].filter(Boolean) },
                    { icon: MapPin, title: "Livraison", stepBack: 2,
                      lines: [`${address.city}, ${address.district}`, address.address_details, address.landmark ? `📍 ${address.landmark}` : ""].filter(Boolean) },
                    { icon: CreditCard, title: "Paiement", stepBack: 3,
                      lines: [paymentLabel, payment.payment_phone].filter(Boolean) },
                  ].map(({ icon: Icon, title, stepBack, lines }) => (
                    <div key={title} className="flex items-start gap-3 py-4 first:pt-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
                        {lines.map((l, i) => (
                          <p key={i} className={`text-sm ${i === 0 ? "font-semibold text-[#0F172A]" : "text-gray-500"}`}>{l as string}</p>
                        ))}
                      </div>
                      <button onClick={() => { setErrors({}); setStep(stepBack); }}
                        className="text-xs text-[#16A34A] font-semibold hover:underline shrink-0 mt-0.5">
                        Modifier
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="font-bold text-[#0F172A] mb-4">Articles ({totalItems()})</h3>
                  <div className="space-y-4">
                    {items.map(item => {
                      const unit = item.product.current_price + (item.variant?.price_adjustment ?? 0);
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-14 h-14 bg-gray-50 rounded-xl shrink-0 overflow-hidden">
                            {item.product.main_image_url
                              ? <Image src={item.product.main_image_url} alt={item.product.name} fill className="object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#0F172A] text-sm line-clamp-1">{item.product.name}</p>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {item.variant?.size  && <span className="text-xs text-gray-400">Taille : {item.variant.size}</span>}
                              {item.variant?.color && <span className="text-xs text-gray-400">Couleur : {item.variant.color}</span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">Qté : {item.quantity} × {formatPrice(unit)}</p>
                          </div>
                          <p className="font-bold text-[#16A34A] text-sm shrink-0">{formatPrice(unit * item.quantity)}</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Code promo */}
                  <div className="border-t border-gray-100 mt-5 pt-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green/30 rounded-xl px-3 py-2.5">
                        <span className="flex items-center gap-2 text-sm font-semibold text-[#16A34A]">
                          <Ticket size={15} /> {appliedCoupon.code} appliqué
                        </span>
                        <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-500 transition-colors" title="Retirer le code">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Code promo</label>
                        <div className="flex gap-2">
                          <input
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="BIENVENUE10"
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-colors uppercase"
                          />
                          <button
                            type="button"
                            onClick={applyCoupon}
                            disabled={couponPending || !couponInput.trim()}
                            className="bg-[#0F172A] text-white text-sm font-semibold px-4 rounded-xl hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {couponPending ? "…" : "Appliquer"}
                          </button>
                        </div>
                        {couponError && <p className="text-xs text-red-600 mt-1.5">{couponError}</p>}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sous-total</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Livraison</span>
                      <span className={`font-medium ${deliveryFee === 0 ? "text-[#16A34A]" : ""}`}>
                        {deliveryFee === 0 ? "Gratuite 🎉" : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Réduction{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
                        <span className="font-medium text-[#16A34A]">− {formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-100">
                      <span className="text-[#0F172A]">Total</span>
                      <span className="text-[#16A34A]">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                    Erreur : {submitError}
                  </div>
                )}

                <div className="hidden lg:block space-y-3">
                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full flex items-center justify-center gap-3 bg-[#16A34A] text-white py-4 rounded-2xl font-bold text-base hover:bg-[#15803d] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting
                      ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Traitement…</>
                      : <><Lock size={17} /> Confirmer ma commande</>}
                  </button>
                  <p className="text-center text-xs text-gray-400">
                    En confirmant, vous acceptez nos <Link href="/conditions" className="underline">conditions de vente</Link>
                  </p>
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="hidden lg:flex gap-3">
                {step > 1 && (
                  <button onClick={goPrev}
                    className="flex items-center gap-2 border border-gray-200 text-[#0F172A] px-6 py-3.5 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all">
                    <ChevronLeft size={16} /> Précédent
                  </button>
                )}
                <button onClick={goNext}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#16A34A] text-white py-3.5 rounded-2xl font-bold text-base hover:bg-[#15803d] active:scale-95 transition-all">
                  Continuer <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
            {orderSummary}
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-4 py-3 z-40 shadow-2xl">
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={goPrev}
              className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-2xl text-gray-500 active:bg-gray-50 shrink-0 transition-all">
              <ChevronLeft size={20} />
            </button>
          )}
          {step < 4 ? (
            <button onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 bg-[#16A34A] text-white py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all">
              Continuer <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-[#16A34A] text-white py-3.5 rounded-2xl font-bold text-base active:scale-95 transition-all disabled:opacity-60">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> En cours…</>
                : <><Lock size={16} /> Confirmer</>}
            </button>
          )}
        </div>
        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-xs text-gray-400">Étape {step} sur 4</span>
          <span className="text-xs font-bold text-[#16A34A]">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
