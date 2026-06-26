"use client";

import { useState } from "react";
import { Save, Store, Truck, Share2 } from "lucide-react";

export default function AdminParametresPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F172A] mb-1">Paramètres de la boutique</h1>
      <p className="text-text-secondary text-sm mb-6">Gérez les informations et la configuration de votre boutique</p>

      <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
        {/* Infos boutique */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store size={18} className="text-green" />
            <h2 className="font-semibold text-[#0F172A]">Informations générales</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Nom de la boutique", value: "Odm's Shopping" },
              { label: "Email", value: "odms-shopping@gmail.com", type: "email" },
              { label: "Téléphone", value: "+241 62 57 37 48", type: "tel" },
              { label: "WhatsApp", value: "+241 62 57 37 48", type: "tel" },
              { label: "Ville", value: "Libreville" },
              { label: "Pays", value: "Gabon" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{f.label}</label>
                <input type={f.type || "text"} defaultValue={f.value} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Livraison */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} className="text-green" />
            <h2 className="font-semibold text-[#0F172A]">Livraison</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Frais de livraison (FCFA)</label>
              <input type="number" defaultValue={2000} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Livraison gratuite à partir de (FCFA)</label>
              <input type="number" defaultValue={100000} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Share2 size={18} className="text-green" />
            <h2 className="font-semibold text-[#0F172A]">Réseaux sociaux</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {["Facebook", "TikTok", "Instagram"].map((s) => (
              <div key={s}>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{s}</label>
                <input type="url" placeholder={`https://...`} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 bg-green hover:bg-[#15803d] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Save size={16} /> Enregistrer les modifications
          </button>
          {saved && <span className="text-green text-sm font-medium">✓ Paramètres enregistrés</span>}
        </div>
      </form>
    </div>
  );
}
