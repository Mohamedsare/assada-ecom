import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Home, Search, Store, Sparkles, Tag, ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { CATEGORIES } from "@/lib/constants";
import { getWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/utils";
import { getShopLogo } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Page introuvable (404)",
  description: "La page que vous recherchez n'existe pas ou a été déplacée. Revenez à la boutique RYTA.",
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: "/boutique", label: "Boutique", icon: Store },
  { href: "/nouveautes", label: "Nouveautés", icon: Sparkles },
  { href: "/promotions", label: "Promotions", icon: Tag },
];

export default async function NotFound() {
  const logoUrl = await getShopLogo();
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-[#0A2A52] via-[#0E2440] to-[#0A2A52] text-white">
      {/* Logo */}
      <div className="px-4 py-6">
        <Link href="/" className="inline-flex items-center" aria-label="RYTA — Accueil">
          <Image src={logoUrl} alt="RYTA" width={200} height={130} priority className="h-12 w-auto object-contain" />
        </Link>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl text-center">
          {/* Visuel 404 */}
          <div className="relative inline-block mb-6">
            <span className="text-[7rem] sm:text-[9rem] font-extrabold leading-none bg-gradient-to-br from-[#54B85E] to-[#0A2A52] bg-clip-text text-transparent select-none">
              404
            </span>
            <div className="absolute -inset-6 bg-[#2F9E44]/20 blur-3xl rounded-full -z-10" aria-hidden="true" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Oups, cette page est introuvable</h1>
          <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
            La page que vous cherchez n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude — retrouvez tout ce qu&apos;il vous faut ci-dessous.
          </p>

          {/* Recherche (fonctionne sans JavaScript) */}
          <form action="/recherche" method="get" className="flex items-center max-w-md mx-auto mb-8" role="search">
            <input
              type="text"
              name="q"
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className="flex-1 bg-white/10 border border-white/20 rounded-l-xl px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:border-[#54B85E] transition-colors"
            />
            <button type="submit" className="bg-[#2F9E44] btn-sweep hover:bg-[#237A34] px-5 py-3 rounded-r-xl transition-colors" aria-label="Lancer la recherche">
              <Search size={18} />
            </button>
          </form>

          {/* CTAs principaux */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/" className="inline-flex items-center justify-center gap-2 bg-[#2F9E44] btn-sweep hover:bg-[#237A34] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <Home size={18} /> Retour à l&apos;accueil
            </Link>
            <Link href="/boutique" className="inline-flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              <Store size={18} /> Voir la boutique
            </Link>
          </div>

          {/* Liens rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 transition-colors">
                <Icon size={20} className="text-[#54B85E]" />
                <span className="text-xs font-medium text-gray-200">{label}</span>
              </Link>
            ))}
          </div>

          {/* Catégories populaires */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/boutique?categorie=${cat.slug}`}
                className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 hover:bg-[#2F9E44] hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <CategoryIcon slug={cat.slug} size={13} />
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Aide WhatsApp */}
          <Link
            href={getWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#54B85E] transition-colors"
          >
            Besoin d&apos;aide ? Contactez-nous sur WhatsApp <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
