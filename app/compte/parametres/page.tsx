"use client";

import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { updateProfile, updatePassword } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export default function ParametresPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data as Profile);
    }
    load();
  }, []);

  async function handleProfileSubmit(formData: FormData) {
    setSavingProfile(true);
    setProfileMsg(null);
    const result = await updateProfile(formData);
    if (result?.error) {
      setProfileMsg({ type: "error", text: result.error });
    } else {
      setProfileMsg({ type: "success", text: "Profil mis à jour avec succès !" });
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(data as Profile);
      }
    }
    setSavingProfile(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    const fd = new FormData();
    fd.append("password", newPassword);
    const result = await updatePassword(fd);
    if (result?.error) {
      setPasswordMsg({ type: "error", text: result.error });
    } else {
      setPasswordMsg({ type: "success", text: "Mot de passe mis à jour !" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#020B27] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#020B27]">Informations personnelles</h1>

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#020B27] mb-4">Profil</h2>
        <form action={handleProfileSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Prénom", name: "first_name", type: "text", value: profile.first_name ?? "" },
              { label: "Nom", name: "last_name", type: "text", value: profile.last_name ?? "" },
              { label: "Téléphone WhatsApp", name: "phone", type: "tel", value: profile.phone ?? "" },
              { label: "Email", name: "email", type: "email", value: profile.email ?? "", readOnly: true },
            ].map(({ label, name, type, value, readOnly }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-[#020B27] mb-1.5">{label}</label>
                <input
                  type={type}
                  name={name}
                  defaultValue={value}
                  readOnly={readOnly}
                  className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${readOnly ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "focus:border-[#16A34A]"}`}
                />
              </div>
            ))}
          </div>

          {profileMsg && (
            <div className={`mt-4 flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${profileMsg.type === "success" ? "bg-green-50 text-[#020B27]" : "bg-red-50 text-red-600"}`}>
              {profileMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-4 flex items-center gap-2 bg-[#16A34A] text-[#020B27] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803D] transition-colors disabled:opacity-60"
          >
            {savingProfile ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Enregistrer
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#020B27] mb-4">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {[
            { label: "Nouveau mot de passe", value: newPassword, onChange: setNewPassword },
            { label: "Confirmer le mot de passe", value: confirmPassword, onChange: setConfirmPassword },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-[#020B27] mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          {passwordMsg && (
            <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${passwordMsg.type === "success" ? "bg-green-50 text-[#020B27]" : "bg-red-50 text-red-600"}`}>
              {passwordMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {passwordMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 bg-[#0F172A] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
          >
            {savingPassword ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Changer le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
