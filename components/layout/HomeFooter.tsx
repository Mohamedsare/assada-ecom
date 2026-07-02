"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Users,
  Lock,
} from "lucide-react";
import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import { getWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/utils";

/* ── Bande avantages ── */
const ADVANTAGES = [
  { icon: ShieldCheck, title: "Produits 100% authentiques", desc: "Des produits de qualité garantis" },
  { icon: RotateCcw, title: "Satisfait ou remboursé", desc: "Retour facile sous 7 jours après réception" },
  { icon: Users, title: "Clients satisfaits", desc: "Plus de 5 000 clients nous font déjà confiance" },
  { icon: Lock, title: "Sécurisé", desc: "Vos données sont protégées et sécurisées" },
];

/* ── Galerie Instagram (déposez les images dans /public/gallery/) ── */
const GALLERY = [
  { image: "/categories/parfums.jpeg", emoji: "🌸", bg: "bg-pink-100" },
  { image: "/categories/soins-visage.jpeg", emoji: "✨", bg: "bg-rose-100" },
  { image: "/categories/maquillage.jpeg", emoji: "💄", bg: "bg-fuchsia-100" },
  { image: "/categories/soins-cheveux.jpeg", emoji: "💆", bg: "bg-amber-100" },
  { image: "/categories/cadeaux.jpeg", emoji: "🎁", bg: "bg-gray-100" },
];

function GalleryImg({ item, alt }: { item: (typeof GALLERY)[number]; alt: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className={`relative aspect-square rounded-xl overflow-hidden ${item.bg} group cursor-pointer`}>
      {!err ? (
        <Image
          src={item.image}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 40vw, 16vw"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">{item.emoji}</div>
      )}
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Nouveautés", href: "/nouveautes" },
  { label: "Promotions", href: "/promotions" },
  { label: "Suivi commande", href: "/suivi-commande" },
  { label: "Contact", href: "/contact" },
];

const CATEGORY_LINKS = [
  { label: "Parfums", href: "/boutique?categorie=parfums" },
  { label: "Maquillage", href: "/boutique?categorie=maquillage" },
  { label: "Soins du visage", href: "/boutique?categorie=soins-visage" },
  { label: "Soins du corps", href: "/boutique?categorie=soins-corps" },
  { label: "Soins des cheveux", href: "/boutique?categorie=soins-cheveux" },
  { label: "Hygiène", href: "/boutique?categorie=hygiene" },
  { label: "Accessoires", href: "/boutique?categorie=accessoires" },
  { label: "Cadeaux", href: "/boutique?categorie=cadeaux" },
  { label: "Bien-être", href: "/boutique?categorie=bien-etre" },
];

const INFO_LINKS = [
  { label: "À propos", href: "/a-propos" },
  { label: "Livraison & Retours", href: "/livraison-retours" },
  { label: "Conditions d'utilisation", href: "/conditions" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "FAQ", href: "/faq" },
];

export default function HomeFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-night text-gray-300">
      {/* ── Bande avantages ── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-7 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((adv) => {
            const Icon = adv.icon;
            return (
              <div key={adv.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green/15 text-green-light flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{adv.title}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-tight">{adv.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Galerie Instagram ── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_2.2fr] gap-8 items-center">
          {/* Texte */}
          <div>
            <p className="text-xs font-bold text-green-light uppercase tracking-widest mb-2">
              Suivez-nous
            </p>
            <p className="text-white text-2xl font-extrabold mb-1">@assada</p>
            <p className="text-gray-400 text-sm mb-5">Découvrez nos produits en images</p>
            <Link
              href="https://www.instagram.com/assada"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green hover:bg-[#15803D] text-[#020B27] text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.17.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.17 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.17-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.41-2.19a3.6 3.6 0 00-.88-1.35 3.6 3.6 0 00-1.35-.88c-.42-.17-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 2.76a5.46 5.46 0 110 10.92 5.46 5.46 0 010-10.92zm0 9a3.54 3.54 0 100-7.08 3.54 3.54 0 000 7.08zm6.95-9.22a1.27 1.27 0 11-2.55 0 1.27 1.27 0 012.55 0z" />
              </svg>
              Nous suivre sur Instagram
            </Link>
          </div>

          {/* Images */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {GALLERY.map((item, i) => (
              <GalleryImg key={i} item={item} alt={`Publication ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer principal ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/logo1.png"
                alt="Assada"
                width={180}
                height={120}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4 text-gray-400">
              Votre boutique en ligne numéro 1 à Casablanca. Qualité, confiance et satisfaction garanties.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href={`tel:${SITE_PHONE}`} className="flex items-center gap-2 hover:text-green-light transition-colors">
                <Phone size={14} /> {SITE_PHONE}
              </a>
              <a href={`mailto:${SITE_EMAIL}`} className="flex items-center gap-2 hover:text-green-light transition-colors">
                <Mail size={14} /> {SITE_EMAIL}
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> Galerie Derb Ghalef, Bd Abdelmoumen, Casablanca
              </span>
            </div>
            <div className="flex gap-3 mt-5">
              {[
                { label: "Facebook", href: "https://www.facebook.com/assada" },
                { label: "Instagram", href: "https://www.instagram.com/assada" },
                { label: "TikTok", href: "https://www.tiktok.com/@assada" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-green transition-colors"
                >
                  {s.label === "Facebook" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.52c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z" /></svg>
                  )}
                  {s.label === "Instagram" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 2.76a7.08 7.08 0 100 14.16 7.08 7.08 0 000-14.16zm0 11.68a4.6 4.6 0 110-9.2 4.6 4.6 0 010 9.2zm7.2-11.85a1.27 1.27 0 11-2.55 0 1.27 1.27 0 012.55 0z" /></svg>
                  )}
                  {s.label === "TikTok" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z" /></svg>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-green-light transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2.5 text-sm">
              {CATEGORY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-green-light transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informations</h3>
            <ul className="space-y-2.5 text-sm">
              {INFO_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-green-light transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Abonnez-vous pour recevoir nos offres exclusives.</p>
            {subscribed ? (
              <p className="text-green-light text-sm font-medium">✓ Merci, vous êtes inscrit !</p>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-green-light transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-green hover:bg-[#15803D] text-[#020B27] font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  S&apos;abonner
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Barre du bas ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Assada — Tous droits réservés
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 mr-1">Paiement :</span>
            {[
              { src: "/paiments/paiement-livraison.jpeg", alt: "Paiement à la livraison" },
            ].map((p) => (
              <span key={p.src} className="relative h-7 w-11 overflow-hidden rounded bg-white">
                <Image src={p.src} alt={p.alt} fill className="object-contain p-0.5" sizes="44px" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
