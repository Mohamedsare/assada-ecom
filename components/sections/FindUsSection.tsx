"use client";

import { useState } from "react";
import { MapPin, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle, ExternalLink, Clock } from "lucide-react";
import { createContactMessage } from "@/lib/supabase/actions";
import { SITE_PHONE, SHOP_ADDRESS } from "@/lib/constants";

const MAP_QUERY = encodeURIComponent(`${SHOP_ADDRESS}, Maroc`);
const MAP_EMBED = `https://maps.google.com/maps?q=${MAP_QUERY}&z=16&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;

export default function FindUsSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.message.trim()) {
      setError("Veuillez renseigner votre nom et votre message.");
      return;
    }
    setSending(true);
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("phone", form.phone);
    fd.set("message", form.message);
    const res = await createContactMessage(fd);
    setSending(false);
    if (res?.error) setError(res.error);
    else setSent(true);
  }

  return (
    <section className="py-14 px-4 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A6D3F] bg-green/15 px-3 py-1 rounded-full">
            <MapPin size={13} /> Boutique physique au Boulevard Abdelmoumen
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0A2A52]">Trouvez notre boutique</h2>
          <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
            Passez nous voir à Casablanca ou écrivez-nous un mot — nous vous répondons rapidement.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Gauche — Formulaire */}
          <div className="bg-gray-light rounded-2xl border border-gray-100 p-5 sm:p-6 order-2 lg:order-1">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-14 h-14 rounded-full bg-green/15 flex items-center justify-center mb-4">
                  <CheckCircle size={28} className="text-green" />
                </div>
                <h3 className="font-bold text-[#0A2A52] text-lg">Message envoyé !</h3>
                <p className="text-sm text-text-secondary mt-1.5 max-w-xs">
                  Merci {form.name.split(" ")[0]}, nous vous recontactons très vite.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", phone: "", message: "" }); }}
                  className="mt-5 text-sm font-semibold text-green hover:underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-[#0A2A52]">Écrivez-nous</h3>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Nom complet</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text" value={form.name} onChange={set("name")} required
                      placeholder="Votre nom et prénom"
                      className="w-full border border-gray-200 rounded-xl bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] focus:ring-2 focus:ring-[#2F9E44]/15 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Téléphone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="tel" value={form.phone} onChange={set("phone")}
                      placeholder="Ex : 06 12 34 56 78"
                      className="w-full border border-gray-200 rounded-xl bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] focus:ring-2 focus:ring-[#2F9E44]/15 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0A2A52] mb-1.5">Message</label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                    <textarea
                      value={form.message} onChange={set("message")} required rows={4}
                      placeholder="Votre message…"
                      className="w-full border border-gray-200 rounded-xl bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#2F9E44] focus:ring-2 focus:ring-[#2F9E44]/15 transition-colors resize-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <button
                  type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-[#2F9E44] btn-sweep hover:bg-[#237A34] text-white py-3 rounded-xl font-bold text-sm transition-colors active:scale-95 disabled:opacity-60"
                >
                  {sending
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi…</>
                    : <><Send size={16} /> Envoyer le message</>}
                </button>
              </form>
            )}
          </div>

          {/* Droite — Carte + infos */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col order-1 lg:order-2 min-h-[360px]">
            <iframe
              title="Localisation de la boutique RYTA à Casablanca"
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full flex-1 min-h-[240px] border-0"
            />
            <div className="bg-night text-white p-5 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={17} className="text-green-light shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">RYTA — Produits de beauté, produits du terroir et compléments alimentaires</p>
                  <p className="text-xs text-gray-400 mt-0.5">{SHOP_ADDRESS}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={17} className="text-green-light shrink-0" />
                <p className="text-xs text-gray-400">Ouvert du lundi au dimanche · 10h – 20h</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={MAP_LINK} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink size={13} /> Itinéraire
                </a>
                <a
                  href={`tel:${SITE_PHONE}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green text-[#0A2A52] hover:bg-green-light px-3 py-2 rounded-lg transition-colors"
                >
                  <Phone size={13} /> {SITE_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
