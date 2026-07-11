"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  User,
  X,
  ChevronRight,
  Gift,
} from "lucide-react";
import { cn, getWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/utils";
import { AXES, WHATSAPP_NUMBER } from "@/lib/constants";
import { useCartStore } from "@/stores/cart";
import { useUIStore } from "@/stores/ui";
import SearchAutocomplete from "@/components/search/SearchAutocomplete";
import SearchDrawer from "@/components/search/SearchDrawer";
import UniversMenu from "@/components/layout/UniversMenu";
import AxisMegaMenu from "@/components/layout/AxisMegaMenu";
import MobileUniversMenu from "@/components/layout/MobileUniversMenu";
import MobileCategoryMenu from "@/components/layout/MobileCategoryMenu";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const SOCIAL_LINKS = [
  { label: "TikTok", href: "https://www.tiktok.com/@ryta" },
  { label: "Facebook", href: "https://www.facebook.com/ryta" },
  { label: "Instagram", href: "https://www.instagram.com/ryta" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // On s'abonne à la valeur dérivée (et non à la fonction) pour que le badge
  // se re-rende dès que le panier change, sans attendre un changement de page.
  const totalItems     = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const openCartDrawer = useUIStore((s) => s.openCartDrawer);

  // Header façon app : glisse hors de l'écran en descendant, revient en montant.
  // On le garde visible en haut de page et tant que le menu mobile est ouvert.
  const { scrolledDown, atTop } = useScrollDirection();
  const hidden = scrolledDown && !atTop && !mobileOpen;

  // Évite l'erreur d'hydratation : le panier (localStorage) n'existe qu'au client
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Verrouille le scroll du body quand le tiroir mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "bg-white text-[#020B27] sticky top-0 z-50 shadow-sm border-b border-gray-100 transition-transform duration-300 ease-out",
        hidden && "-translate-y-full"
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between min-h-16 lg:py-2">
          {/* Menu burger — mobile uniquement, à gauche */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={22} />
            ) : (
              <svg
                width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"
              >
                <line x1="3.5" y1="7" x2="20.5" y2="7" />
                <line x1="3.5" y1="12" x2="18" y2="12" />
                <line x1="3.5" y1="17" x2="15.5" y2="17" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/ryta.png"
              alt="RYTA"
              width={220}
              height={150}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation — axes + Coffrets + L'univers, répartis sur deux lignes */}
          <nav className="hidden lg:flex lg:flex-wrap content-center items-center gap-x-1 gap-y-1 max-w-[560px]">
            {AXES.map((axis) => (
              <AxisMegaMenu key={axis.slug} axis={axis} active={false} />
            ))}
            <Link
              href="/coffrets-cadeaux"
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#B8925A] hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Coffrets cadeaux
            </Link>
            <UniversMenu />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search — ouvre le tiroir latéral droit */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex p-2 rounded-lg hover:bg-gray-100 hover:text-[#B8925A] transition-colors"
              aria-label="Rechercher"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <button
              onClick={openCartDrawer}
              className="relative p-2 rounded-lg hover:bg-gray-100 hover:text-[#B8925A] transition-colors"
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart size={20} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#B8925A] text-[#020B27] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Account — desktop uniquement */}
            <Link
              href="/compte"
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 hover:text-[#B8925A] transition-colors"
              aria-label="Mon compte"
            >
              <User size={20} />
            </Link>
          </div>
        </div>

      </div>

      {/* Tiroir de recherche latéral droit */}
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Menu Mobile — tiroir latéral gauche ── */}
      <div
        className={cn("lg:hidden fixed inset-0 z-[80]", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Panneau */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute left-0 top-0 h-full w-[92%] max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* En-tête + recherche */}
          <div className="shrink-0">
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
                className="p-1.5 rounded-lg text-[#020B27] hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-4 pt-3 pb-4 border-b border-gray-100">
              <SearchAutocomplete variant="block" onClose={() => setMobileOpen(false)} />
            </div>
          </div>

          {/* Liens — les 3 grands axes + L'univers RYTA en accordéon */}
          <nav className="flex-1 overflow-y-auto">
            <MobileCategoryMenu onNavigate={() => setMobileOpen(false)} />
            <MobileUniversMenu onNavigate={() => setMobileOpen(false)} />
            <Link
              href="/coffrets-cadeaux"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100 text-base font-bold uppercase tracking-wide text-[#020B27] hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2.5"><Gift size={18} /> Coffrets cadeaux</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              href="/compte"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-100 text-base font-bold uppercase tracking-wide text-[#020B27] hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2.5"><User size={18} /> Mon compte</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>

            {/* Réseaux sociaux */}
            <div className="px-5 py-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Suivez-nous</p>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#020B27] hover:bg-green hover:border-green hover:text-[#020B27] transition-colors"
                  >
                    {s.label === "TikTok" && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z" /></svg>
                    )}
                    {s.label === "Facebook" && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.52c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z" /></svg>
                    )}
                    {s.label === "Instagram" && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 2.76a7.08 7.08 0 100 14.16 7.08 7.08 0 000-14.16zm0 11.68a4.6 4.6 0 110-9.2 4.6 4.6 0 010 9.2zm7.2-11.85a1.27 1.27 0 11-2.55 0 1.27 1.27 0 012.55 0z" /></svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* WhatsApp */}
          <div className="shrink-0 p-4 border-t border-gray-100">
            <Link
              href={getWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#B8925A] text-white py-3 rounded-xl text-sm font-semibold btn-sweep hover:bg-[#9E7A45] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contacter sur WhatsApp
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
