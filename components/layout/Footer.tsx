import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import NewsletterForm from "@/components/layout/NewsletterForm";
import FooterSection from "@/components/layout/FooterSection";

const PAGES_LINKS = [
  { label: "Recherche", href: "/recherche" },
  { label: "Produits locaux", href: "/boutique?categorie=produits-locaux" },
  { label: "Beauté", href: "/boutique?categorie=beaute" },
  { label: "Compléments alimentaires", href: "/boutique?categorie=complements-alimentaires" },
  { label: "Conditions d'utilisation", href: "/conditions" },
  { label: "Confidentialité", href: "/confidentialite" },
];

const LEGAL_LINKS = [
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "Livraison & retours", href: "/livraison-retours" },
  { label: "FAQ", href: "/faq" },
  { label: "Coordonnées", href: "/contact" },
  { label: "Conditions d'utilisation", href: "/conditions" },
];

const SOCIALS: { label: string; href: string; path: string }[] = [
  { label: "Instagram", href: "https://www.instagram.com/ryta", path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 2.76a7.08 7.08 0 100 14.16 7.08 7.08 0 000-14.16zm0 11.68a4.6 4.6 0 110-9.2 4.6 4.6 0 010 9.2zm7.2-11.85a1.27 1.27 0 11-2.55 0 1.27 1.27 0 012.55 0z" },
  { label: "Facebook", href: "https://www.facebook.com/ryta", path: "M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.52c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z" },
  { label: "TikTok", href: "https://www.tiktok.com/@ryta", path: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z" },
];

export default function Footer() {
  return (
    <footer className="bg-[#020B27] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 lg:gap-x-14 gap-y-0 border-t border-white/10 md:border-t-0">
          {/* Service Client */}
          <FooterSection title="Service Client">
            <div className="space-y-2 text-[15px]">
              <a href={`tel:${SITE_PHONE}`} className="flex items-center gap-2 hover:text-[#B8925A] transition-colors">
                <Phone size={15} /> {SITE_PHONE}
              </a>
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-2 hover:text-[#B8925A] transition-colors">
                <Mail size={15} /> {SITE_EMAIL}
              </a>
            </div>

            <div className="flex items-center gap-3 mt-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-[#B8925A] hover:border-[#B8925A] hover:text-[#020B27] transition-colors"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
                </a>
              ))}
            </div>

            <p className="mt-8 text-[15px] leading-relaxed">
              Consultez nos offres spéciales.{" "}
              <Link href="/promotions" className="font-bold text-white underline underline-offset-4 hover:text-[#B8925A] transition-colors">
                Réclamez vos offres.
              </Link>
            </p>
          </FooterSection>

          {/* Pages */}
          <FooterSection title="Pages">
            <ul className="space-y-3.5 text-[15px]">
              {PAGES_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#B8925A] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Newsletter — toujours visible (non repliable) */}
          <div className="py-6 md:py-0">
            <h3 className="text-white text-xl font-bold mb-4 md:mb-6">Abonnez-vous à notre newsletter</h3>
            <p className="text-white font-bold mb-3">Ne rate rien !</p>
            <p className="text-[15px] leading-relaxed mb-6">
              Abonne-toi à notre newsletter et reçois en avant-première nos nouveautés, conseils exclusifs
              et offres spéciales directement dans ta boîte mail.
            </p>
            <NewsletterForm />
            <p className="mt-5 text-xs text-white/50 leading-relaxed">
              ***En vous abonnant, vous acceptez les{" "}
              <Link href="/conditions" className="underline hover:text-white">Conditions d&apos;utilisation</Link> et la{" "}
              <Link href="/confidentialite" className="underline hover:text-white">Politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()},{" "}
            <Link href="/" className="underline underline-offset-4 hover:text-white">RYTA</Link>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-[#B8925A] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
