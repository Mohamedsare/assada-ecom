import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

/**
 * Gabarit partagé des pages légales / informatives (À propos, CGU, Confidentialité,
 * Livraison & Retours, FAQ). Fournit le hero, le fil d'Ariane et une typographie
 * cohérente pour du contenu HTML sémantique (h2/h3/p/ul/a) via variants Tailwind.
 */
export default function LegalPage({
  title,
  subtitle,
  updatedAt,
  heroImage,
  children,
}: {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  /** Image de fond optionnelle pour le hero (ex : page À propos). */
  heroImage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="relative bg-night text-white overflow-hidden">
        {heroImage && (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-linear-to-r from-night via-night/85 to-night/40" />
          </>
        )}
        <div className={`relative max-w-4xl mx-auto px-4 ${heroImage ? "py-16 md:py-24" : "py-12 md:py-16"}`}>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#54B85E] transition-colors">Accueil</Link>
            <ChevronRight size={13} />
            <span className="text-gray-300">{title}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
          {subtitle && <p className="text-gray-300 mt-3 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
        <article
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10
            [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-bold [&_h2]:text-[#0A2A52] [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:scroll-mt-24 first:[&_h2]:mt-0
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#0A2A52] [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:text-[#475569] [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:mb-4 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_li]:text-[#475569] [&_li]:leading-relaxed [&_li]:pl-1 [&_li]:marker:text-[#2F9E44]
            [&_ol]:mb-4 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5
            [&_a]:text-[#2F9E44] [&_a]:font-medium hover:[&_a]:underline
            [&_strong]:text-[#0A2A52] [&_strong]:font-semibold"
        >
          {updatedAt && (
            <p className="!text-xs !text-gray-400 !mb-6 pb-4 border-b border-gray-100">
              Dernière mise à jour : {updatedAt}
            </p>
          )}
          {children}
        </article>

        <p className="text-center text-xs text-text-secondary mt-6">
          Une question ? Contactez-nous via la page{" "}
          <Link href="/contact" className="text-[#2F9E44] font-medium hover:underline">Contact</Link>.
        </p>
      </div>
    </div>
  );
}
