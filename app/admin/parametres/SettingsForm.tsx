"use client";

import { useState } from "react";
import { Save, Store, Truck, Share2 } from "lucide-react";
import { adminUpdateSettings } from "@/lib/supabase/actions";

export interface SettingsValues {
  shop_name: string;
  shop_email: string;
  shop_phone: string;
  shop_whatsapp: string;
  shop_city: string;
  shop_address: string;
  delivery_fee: string;
  free_delivery_threshold: string;
  facebook_url: string;
  tiktok_url: string;
  instagram_url: string;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green transition-colors";

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      const res = await adminUpdateSettings(formData);
      if (res?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError("Échec de l'enregistrement. Réessayez.");
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-5 max-w-3xl">
      {/* Infos boutique */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Store size={18} className="text-green" />
          <h2 className="font-semibold text-[#0F172A]">Informations générales</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom de la boutique" name="shop_name" defaultValue={initial.shop_name} />
          <Field label="Email" name="shop_email" type="email" defaultValue={initial.shop_email} />
          <Field label="Téléphone" name="shop_phone" type="tel" defaultValue={initial.shop_phone} />
          <Field label="WhatsApp" name="shop_whatsapp" type="tel" defaultValue={initial.shop_whatsapp} />
          <Field label="Ville" name="shop_city" defaultValue={initial.shop_city} />
          <Field label="Adresse" name="shop_address" defaultValue={initial.shop_address} />
        </div>
      </div>

      {/* Livraison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Truck size={18} className="text-green" />
          <h2 className="font-semibold text-[#0F172A]">Livraison</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Frais de livraison (FCFA)" name="delivery_fee" type="number" defaultValue={initial.delivery_fee} />
          <Field label="Livraison gratuite à partir de (FCFA)" name="free_delivery_threshold" type="number" defaultValue={initial.free_delivery_threshold} />
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={18} className="text-green" />
          <h2 className="font-semibold text-[#0F172A]">Réseaux sociaux</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Facebook" name="facebook_url" type="url" defaultValue={initial.facebook_url} />
          <Field label="TikTok" name="tiktok_url" type="url" defaultValue={initial.tiktok_url} />
          <Field label="Instagram" name="instagram_url" type="url" defaultValue={initial.instagram_url} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-green hover:bg-[#15803d] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
        {saved && <span className="text-green text-sm font-medium">✓ Paramètres enregistrés</span>}
        {error && <span className="text-red-600 text-sm font-medium">{error}</span>}
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, type = "text",
}: {
  label: string; name: string; defaultValue: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[#0F172A] mb-1.5">{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} className={inputCls} />
    </div>
  );
}
