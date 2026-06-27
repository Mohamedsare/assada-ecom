"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { SITE_EMAIL, SITE_PHONE, WHATSAPP_NUMBER } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import { createContactMessage } from "@/lib/supabase/actions";
import AdvantagesSection from "@/components/sections/AdvantagesSection";

const FAQ = [
  {
    q: "Quels sont vos délais de livraison ?",
    a: "Nous livrons partout au Gabon en 24 à 48h ouvrables. Pour Libreville, la livraison peut être effectuée le jour même selon disponibilité.",
  },
  {
    q: "Puis-je retourner un article ?",
    a: "Oui, vous disposez de 7 jours après réception pour retourner un article dans son état d'origine. Contactez-nous sur WhatsApp pour initier le retour.",
  },
  {
    q: "Quels sont les moyens de paiement acceptés ?",
    a: "Nous acceptons le paiement en espèces à la livraison, Airtel Money et Moov Money. Le paiement en ligne sera disponible prochainement.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Rendez-vous sur notre page Suivi commande et entrez votre numéro de commande ou votre email. Vous pouvez aussi nous contacter sur WhatsApp.",
  },
];

export default function ContactContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("email", form.email);
    fd.set("subject", form.subject);
    fd.set("message", form.message);
    const res = await createContactMessage(fd);
    setSending(false);
    if (res?.error) setError(res.error);
    else setSent(true);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#020B27] to-[#0F172A] text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#16A34A]/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Nous sommes là<br />
            <span className="text-[#22C55E]">pour vous aider !</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Une question, un problème ? Contactez-nous, nous répondons vite.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Nos coordonnées</h2>
            <div className="space-y-4 mb-8">
              {[
                {
                  icon: Phone,
                  label: "Téléphone",
                  value: SITE_PHONE,
                  href: `tel:${SITE_PHONE}`,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: SITE_EMAIL,
                  href: `mailto:${SITE_EMAIL}`,
                  color: "bg-green-50 text-[#16A34A]",
                },
                {
                  icon: MapPin,
                  label: "Adresse",
                  value: "Libreville, Gabon",
                  href: "https://maps.google.com/?q=Libreville,Gabon",
                  color: "bg-red-50 text-red-600",
                },
                {
                  icon: MessageCircle,
                  label: "WhatsApp",
                  value: `+${WHATSAPP_NUMBER}`,
                  href: getWhatsAppUrl("Bonjour Odm's Shopping, je souhaite vous contacter."),
                  color: "bg-emerald-50 text-emerald-600",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#16A34A] hover:shadow-sm transition-all"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">{item.label}</p>
                      <p className="font-semibold text-[#0F172A]">{item.value}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#0F172A] mb-4">Réseaux sociaux</h3>
              <div className="flex gap-3">
                {[
                  { label: "TikTok", href: "https://www.tiktok.com/@odmsshopping", bg: "bg-gray-900" },
                  { label: "Facebook", href: "https://www.facebook.com/odmsshopping", bg: "bg-[#1877F2]" },
                  { label: "WhatsApp", href: getWhatsAppUrl("Bonjour Odm's Shopping"), bg: "bg-[#25D366]" },
                ].map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${s.bg} text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-6 bg-gray-100 rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200">
              <div className="text-center text-gray-500">
                <MapPin size={36} className="mx-auto mb-2 text-[#16A34A]" />
                <p className="font-medium">Libreville, Gabon</p>
                <Link
                  href="https://maps.google.com/?q=Libreville,Gabon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#16A34A] hover:underline mt-1 block"
                >
                  Voir sur Google Maps
                </Link>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Envoyez-nous un message</h2>

            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Message envoyé !</h3>
                <p className="text-[#64748B]">Nous vous répondrons dans les plus brefs délais.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-4 text-sm text-[#16A34A] hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jean@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Sujet</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-colors text-[#0F172A]"
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option>Question sur un produit</option>
                    <option>Suivi de commande</option>
                    <option>Retour / Remboursement</option>
                    <option>Problème de livraison</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-[#16A34A] text-white py-3 rounded-xl font-semibold hover:bg-[#15803d] disabled:opacity-60 transition-colors"
                >
                  <Send size={16} />
                  {sending ? "Envoi en cours…" : "Envoyer le message"}
                </button>
              </form>
            )}

            {/* FAQ */}
            <div className="mt-8">
              <h3 className="font-bold text-[#0F172A] mb-4">Questions fréquentes</h3>
              <div className="space-y-3">
                {FAQ.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-[#0F172A] text-sm">{item.q}</span>
                      {openFaq === i ? <ChevronUp size={16} className="text-[#16A34A]" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-3">
                        <p className="text-sm text-[#64748B] leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdvantagesSection />
    </div>
  );
}
