"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Save, X, CheckCircle, AlertCircle } from "lucide-react";
import { createAddress, updateAddress, deleteAddress } from "@/lib/supabase/actions";
import type { Address } from "@/types";

type FormData = {
  full_name: string;
  phone: string;
  city: string;
  district: string;
  address_details: string;
  landmark: string;
  is_default: boolean;
};

const emptyForm: FormData = {
  full_name: "",
  phone: "",
  city: "Casablanca",
  district: "",
  address_details: "",
  landmark: "",
  is_default: false,
};

export default function AdressesContent({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMsg(null);
  }

  function openEdit(address: Address) {
    setForm({
      full_name: address.full_name,
      phone: address.phone,
      city: address.city,
      district: address.district,
      address_details: address.address_details ?? "",
      landmark: address.landmark ?? "",
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
    setMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

    let result;
    if (editingId) {
      result = await updateAddress(editingId, fd);
    } else {
      result = await createAddress(fd);
    }

    if (result?.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setMsg({ type: "success", text: editingId ? "Adresse mise à jour !" : "Adresse ajoutée !" });
      setShowForm(false);
      // Refresh addresses from the form submission result by re-fetching via the browser supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
        if (data) setAddresses(data as Address[]);
      }
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette adresse ?")) return;
    setDeleting(id);
    const result = await deleteAddress(id);
    if (result?.error) {
      setMsg({ type: "error", text: result.error });
    } else {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#020B27]">Mes adresses</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#B8925A] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#9E7A45] transition-colors"
        >
          <Plus size={15} />
          Ajouter une adresse
        </button>
      </div>

      {msg && (
        <div className={`mb-4 flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${msg.type === "success" ? "bg-green-50 text-[#020B27]" : "bg-red-50 text-red-600"}`}>
          {msg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#020B27]/30 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#020B27]">
              {editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Nom complet", name: "full_name", type: "text", required: true },
              { label: "Téléphone WhatsApp", name: "phone", type: "tel", required: true },
              { label: "Ville", name: "city", type: "text", required: true },
              { label: "Quartier", name: "district", type: "text", required: true },
              { label: "Adresse détaillée", name: "address_details", type: "text" },
              { label: "Repère", name: "landmark", type: "text" },
            ].map(({ label, name, type, required }) => (
              <div key={name} className={name === "address_details" || name === "landmark" ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-medium text-[#020B27] mb-1.5">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={type}
                  value={form[name as keyof FormData] as string}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  required={required}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B8925A] transition-colors"
                />
              </div>
            ))}

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 accent-[#020B27]"
              />
              <label htmlFor="is_default" className="text-sm text-[#020B27]">
                Définir comme adresse par défaut
              </label>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#B8925A] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#9E7A45] transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {editingId ? "Mettre à jour" : "Ajouter"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-white rounded-2xl border p-5 relative ${address.is_default ? "border-[#020B27]" : "border-gray-100"}`}
          >
            {address.is_default && (
              <span className="absolute top-3 right-3 bg-[#B8925A]/10 text-[#020B27] text-xs font-bold px-2 py-0.5 rounded-full">
                Par défaut
              </span>
            )}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-[#020B27]" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-[#020B27]">{address.full_name}</p>
                <p className="text-[#64748B]">{address.phone}</p>
                <p className="text-[#64748B]">{address.district}, {address.city}</p>
                {address.address_details && (
                  <p className="text-[#64748B]">{address.address_details}</p>
                )}
                {address.landmark && (
                  <p className="text-[#64748B] text-xs">Repère : {address.landmark}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(address)}
                className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[#B8925A] hover:text-[#020B27] transition-colors"
              >
                <Pencil size={12} />
                Modifier
              </button>
              {!address.is_default && (
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deleting === address.id}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-60"
                >
                  {deleting === address.id ? (
                    <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={openAdd}
          className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-[#B8925A] hover:bg-[#B8925A]/5 transition-colors min-h-[140px]"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Plus size={20} className="text-gray-400" />
          </div>
          <span className="text-sm font-medium text-[#64748B]">Ajouter une adresse</span>
        </button>
      </div>
    </div>
  );
}
