"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, EyeOff, CheckCircle, AlertCircle, Mail, Phone, ShieldCheck } from "lucide-react";
import { updateProfile, updatePassword } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import AvatarUpload from "@/components/ui/AvatarUpload";
import type { Profile } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  super_admin: "Super Admin",
  employee: "Employé",
};

export default function AdminProfilPage() {
  const router = useRouter();
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
      // Rafraîchit la topbar (avatar + nom) via le layout serveur
      router.refresh();
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

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email || "Admin";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Carte profil */}
      <form
        action={handleProfileSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Bandeau dégradé */}
        <div className="h-24 bg-linear-to-r from-night via-[#0F172A] to-green/50" />

        {/* Avatar + identité */}
        <div className="px-5 sm:px-6 -mt-12">
          <AvatarUpload
            name="avatar_url"
            bucket="products"
            fallback={displayName}
            defaultValue={profile.avatar_url ?? ""}
          />
        </div>

        <div className="px-5 sm:px-6 pt-5 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <h1 className="text-lg font-bold text-[#020B27]">{displayName}</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A6D3F] bg-green/15 px-2 py-0.5 rounded-full">
              <ShieldCheck size={12} /> {ROLE_LABELS[profile.role] ?? "Compte"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Prénom", name: "first_name", type: "text", value: profile.first_name ?? "", icon: null },
              { label: "Nom", name: "last_name", type: "text", value: profile.last_name ?? "", icon: null },
              { label: "Téléphone", name: "phone", type: "tel", value: profile.phone ?? "", icon: Phone },
              { label: "Email", name: "email", type: "email", value: profile.email ?? "", readOnly: true, icon: Mail },
            ].map(({ label, name, type, value, readOnly, icon: Icon }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-[#020B27] mb-1.5">{label}</label>
                <div className="relative">
                  {Icon && (
                    <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  )}
                  <input
                    type={type}
                    name={name}
                    defaultValue={value}
                    readOnly={readOnly}
                    className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm outline-none transition-colors ${Icon ? "pl-9 pr-4" : "px-4"} ${readOnly ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "focus:border-[#B8925A] focus:ring-2 focus:ring-[#B8925A]/15"}`}
                  />
                </div>
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
            className="mt-5 flex items-center gap-2 bg-green text-[#020B27] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-light transition-colors disabled:opacity-60"
          >
            {savingProfile ? (
              <span className="w-4 h-4 border-2 border-[#020B27]/30 border-t-[#020B27] rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* Mot de passe */}
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B8925A] transition-colors pr-10"
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
