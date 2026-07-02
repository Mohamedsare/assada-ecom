"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/actions";
import BackButton from "@/components/ui/BackButton";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/compte";
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    oauthError === "oauth"
      ? "La connexion Google a été annulée. Veuillez réessayer."
      : oauthError === "callback"
        ? "Échec de la connexion. Veuillez réessayer."
        : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(
        authError.message.includes("Invalid login credentials")
          ? "Email ou mot de passe incorrect."
          : authError.message
      );
      setLoading(false);
      return;
    }

    // Vérifier le rôle pour rediriger l'admin vers son espace
    let destination = redirect;
    if (authData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (["admin", "super_admin", "employee"].includes(profile?.role ?? "")) {
        destination = "/admin";
      }
    }

    router.push(destination);
    router.refresh();
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      {/* Bouton retour flottant */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <BackButton />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="Assada" width={160} height={56} className="h-16 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-[#020B27] mt-4">Connexion</h1>
          <p className="text-[#64748B] text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Google */}
          <form action={signInWithGoogle}>
            <input type="hidden" name="redirect" value={redirect} />
            <button type="submit"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-[#020B27] hover:bg-gray-50 active:bg-gray-100 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#020B27]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B8925A] focus:ring-2 focus:ring-[#B8925A]/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#020B27]">Mot de passe</label>
                <Link href="/mot-de-passe-oublie" className="text-xs text-[#020B27] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#B8925A] focus:ring-2 focus:ring-[#B8925A]/10 transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#B8925A] text-[#020B27] py-3.5 rounded-xl font-bold text-sm hover:bg-[#9E7A45] active:scale-95 transition-all disabled:opacity-60">
              {loading ? <><Loader2 size={17} className="animate-spin" /> Connexion…</> : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-5">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-[#020B27] font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:underline">← Retour à la boutique</Link>
        </p>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}
