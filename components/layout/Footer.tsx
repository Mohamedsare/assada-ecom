import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { SITE_EMAIL, SITE_PHONE, WHATSAPP_NUMBER } from "@/lib/constants";
import { getWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="bg-[#020B27] text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/logo1.png"
                alt="Odm's Shopping"
                width={180}
                height={120}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Votre boutique en ligne n°1 au Gabon. Chaussures, vêtements, accessoires et électroniques avec livraison rapide partout au Gabon.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href={`tel:${SITE_PHONE}`} className="flex items-center gap-2 hover:text-[#22C55E] transition-colors">
                <Phone size={14} />
                {SITE_PHONE}
              </a>
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-2 hover:text-[#22C55E] transition-colors">
                <Mail size={14} />
                {SITE_EMAIL}
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={14} />
                Libreville, Gabon
              </span>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Accueil", href: "/" },
                { label: "Boutique", href: "/boutique" },
                { label: "Nouveautés", href: "/nouveautes" },
                { label: "Promotions", href: "/promotions" },
                { label: "Suivi commande", href: "/suivi-commande" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#22C55E] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Chaussures Homme", href: "/boutique?categorie=chaussures-homme" },
                { label: "Chaussures Femme", href: "/boutique?categorie=chaussures-femme" },
                { label: "Vêtements Homme", href: "/boutique?categorie=vetements-homme" },
                { label: "Vêtements Femme", href: "/boutique?categorie=vetements-femme" },
                { label: "Électroniques", href: "/boutique?categorie=electroniques" },
                { label: "PC & Accessoires", href: "/boutique?categorie=pc-accessoires" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#22C55E] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations</h3>
            <ul className="space-y-2 text-sm mb-6">
              {[
                { label: "À propos", href: "/a-propos" },
                { label: "Livraison & Retours", href: "/livraison-retours" },
                { label: "Conditions d'utilisation", href: "/conditions" },
                { label: "Politique de confidentialité", href: "/confidentialite" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#22C55E] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social */}
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">Suivez-nous</h4>
              <div className="flex gap-3">
                <Link href="https://www.tiktok.com/@odmsshopping" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#16A34A] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
                  </svg>
                </Link>
                <Link href="https://www.facebook.com/odmsshopping" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#16A34A] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
                <Link href={getWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#16A34A] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Paiement */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-gray-500">Moyens de paiement :</span>
            {[
              { src: "/paiments/paiement-livraison.jpeg", alt: "Espèces à la livraison" },
              { src: "/paiments/airtel-money.jpeg", alt: "Airtel Money" },
              { src: "/paiments/moov-money.jpeg", alt: "Moov Money" },
            ].map((p) => (
              <span key={p.src} className="relative h-8 w-12 overflow-hidden rounded bg-white">
                <Image src={p.src} alt={p.alt} fill className="object-contain p-0.5" sizes="48px" />
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-5 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Odm&apos;s Shopping — Tous droits réservés — Libreville, Gabon</p>
        </div>
      </div>
    </footer>
  );
}
