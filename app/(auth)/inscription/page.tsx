"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/actions";
import BackButton from "@/components/ui/BackButton";

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        },
      },
    });

    if (authError) {
      setError(
        authError.message.includes("already registered")
          ? "Cet email est déjà utilisé."
          : authError.message
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/connexion"), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-[#16A34A]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Compte créé !</h2>
          <p className="text-[#64748B] text-sm">
            Vérifiez votre email pour confirmer votre compte, puis connectez-vous.
          </p>
          <Link href="/connexion"
            className="mt-5 inline-block bg-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#15803d] transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/10 transition-all";

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      {/* Bouton retour flottant */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <BackButton />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo1.png" alt="Odm's Shopping" width={160} height={56} className="h-14 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A] mt-4">Créer un compte</h1>
          <p className="text-[#64748B] text-sm mt-1">Rejoignez Odm&apos;s Shopping dès aujourd&apos;hui</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Google */}
          <form action={signInWithGoogle}>
            <button type="submit"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-[#0F172A] hover:bg-gray-50 active:bg-gray-100 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              S&apos;inscrire avec Google
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#0F172A]">Prénom <span className="text-red-500">*</span></label>
                <input className={inputCls} required placeholder="Jean" value={form.first_name} onChange={set("first_name")} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#0F172A]">Nom <span className="text-red-500">*</span></label>
                <input className={inputCls} required placeholder="Ndong" value={form.last_name} onChange={set("last_name")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0F172A]">Téléphone WhatsApp</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  <span className="text-base">🇬🇦</span>
                  <span className="text-sm font-semibold text-gray-500 border-r border-gray-200 pr-2">+241</span>
                </div>
                <input className={`${inputCls} pl-[4.5rem]`} type="tel" placeholder="62 57 37 48"
                  value={form.phone} onChange={set("phone")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0F172A]">Email <span className="text-red-500">*</span></label>
              <input className={inputCls} type="email" required placeholder="votre@email.com"
                value={form.email} onChange={set("email")} />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0F172A]">Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <input className={`${inputCls} pr-12`} type={showPwd ? "text" : "password"}
                  required minLength={8} placeholder="Minimum 8 caractères"
                  value={form.password} onChange={set("password")} />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#0F172A]">Confirmer le mot de passe <span className="text-red-500">*</span></label>
              <input className={inputCls} type={showPwd ? "text" : "password"}
                required placeholder="Répétez votre mot de passe"
                value={form.password_confirm} onChange={set("password_confirm")} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#16A34A] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#15803d] active:scale-95 transition-all disabled:opacity-60">
              {loading ? <><Loader2 size={17} className="animate-spin" /> Création…</> : "Créer mon compte"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-5">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-[#16A34A] font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:underline">← Retour à la boutique</Link>
        </p>
      </div>
    </div>
  );
}
