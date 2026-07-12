"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { SITE_EMAIL, SITE_PHONE, WHATSAPP_NUMBER } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";
import { createContactMessage } from "@/lib/supabase/actions";
import AdvantagesSection from "@/components/sections/AdvantagesSection";

// Même localisation que la carte de l'accueil (FindUsSection).
const MAP_QUERY = encodeURIComponent("N 10 Galerie Zemouri, Boulevard Abdelmoumen, Casablanca, Maroc");
const MAP_EMBED = `https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`;

const FAQ = [
  {
    q: "Quels sont vos délais de livraison ?",
    a: "Nous livrons partout au Maroc en 24 à 72h ouvrables, gratuitement à partir de 300 DH d'achat. À Casablanca, la livraison peut être effectuée le jour même selon disponibilité.",
  },
  {
    q: "Puis-je retourner un article ?",
    a: "Oui, vous disposez de 7 jours après réception pour retourner un article dans son état d'origine. Contactez-nous sur WhatsApp pour initier le retour.",
  },
  {
    q: "Quels sont les moyens de paiement acceptés ?",
    a: "Nous acceptons le paiement en espèces à la livraison. Le paiement en ligne sera disponible prochainement.",
  },
  {
    q: "Comment connaître l'état de ma commande ?",
    a: "Notre équipe vous contacte sur WhatsApp après votre commande pour la confirmer et organiser la livraison. Écrivez-nous sur WhatsApp avec votre numéro de commande à tout moment.",
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
      {/* En-tête */}
      <div className="max-w-4xl mx-auto text-center px-4 pt-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0A2A52] mb-3">
          Nous sommes là <span className="text-[#2F9E44]">pour vous aider !</span>
        </h1>
        <p className="text-text-secondary text-lg">
          Une question, un problème ? Contactez-nous, nous répondons vite.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-bold text-[#0A2A52] mb-6">Nos coordonnées</h2>
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
                  color: "bg-green-50 text-[#0A2A52]",
                },
                {
                  icon: MapPin,
                  label: "Adresse",
                  value: "Galerie Derb Ghalef, Bd Abdelmoumen, Casablanca",
                  href: "https://maps.google.com/?q=Galerie+Derb+Ghalef+Boulevard+Abdelmoumen+Casablanca",
                  color: "bg-red-50 text-red-600",
                },
                {
                  icon: MessageCircle,
                  label: "WhatsApp",
                  value: `+${WHATSAPP_NUMBER}`,
                  href: getWhatsAppUrl("Bonjour RYTA, je souhaite vous contacter."),
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
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#2F9E44] hover:shadow-sm transition-all"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">{item.label}</p>
                      <p className="font-semibold text-[#0A2A52]">{item.value}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Social */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-[#0A2A52] mb-4">Réseaux sociaux</h3>
              <div className="flex gap-3">
                {[
                  { label: "TikTok", href: "https://www.tiktok.com/@ryta", bg: "bg-gray-900" },
                  { label: "Facebook", href: "https://www.facebook.com/ryta", bg: "bg-[#1877F2]" },
                  { label: "WhatsApp", href: getWhatsAppUrl("Bonjour RYTA"), bg: "bg-whatsapp" },
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

            {/* Carte Google Maps interactive — identique à celle de l'accueil */}
            <div className="mt-6 rounded-2xl overflow-hidden aspect-video border border-gray-200">
              <iframe
                title="Localisation de la boutique RYTA à Casablanca"
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
              />
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold text-[#0A2A52] mb-6">Envoyez-nous un message</h2>

            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-[#2F9E44] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#0A2A52] mb-2">Message envoyé !</h3>
                <p className="text-[#64748B]">Nous vous répondrons dans les plus brefs délais.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-4 text-sm text-[#0A2A52] hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jean@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Sujet</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] transition-colors text-[#0A2A52]"
                  >
                    <option value="">Sélectionner un sujet</option>
                    <option>Question sur un produit</option>
                    <option>Ma commande</option>
                    <option>Retour / Remboursement</option>
                    <option>Problème de livraison</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-[#2F9E44] text-white py-3 rounded-xl font-semibold btn-sweep hover:bg-[#237A34] disabled:opacity-60 transition-colors"
                >
                  <Send size={16} />
                  {sending ? "Envoi en cours…" : "Envoyer le message"}
                </button>
              </form>
            )}

            {/* FAQ */}
            <div className="mt-8">
              <h3 className="font-bold text-[#0A2A52] mb-4">Questions fréquentes</h3>
              <div className="space-y-3">
                {FAQ.map((item, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-[#0A2A52] text-sm">{item.q}</span>
                      {openFaq === i ? <ChevronUp size={16} className="text-[#0A2A52]" /> : <ChevronDown size={16} className="text-gray-400" />}
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
