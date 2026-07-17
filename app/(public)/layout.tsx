import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/layout/SiteFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import UIShell from "@/components/layout/UIShell";
import ConfigHydrator from "@/components/layout/ConfigHydrator";
import { getStoreConfig, getPageImages, getHeroSlides, getNavAxes, getSocialLinks } from "@/lib/supabase/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, images, heroSlides, navAxes, socialLinks] = await Promise.all([getStoreConfig(), getPageImages(), getHeroSlides(), getNavAxes(), getSocialLinks()]);
  return (
    <>
      <ConfigHydrator deliveryFee={config.deliveryFee} freeDeliveryThreshold={config.freeDeliveryThreshold} images={images} heroSlides={heroSlides} socialLinks={socialLinks} />
      <TopBar />
      <Header axes={navAxes} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Espace bas pour ne pas passer sous la barre fixe (mobile uniquement) */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <WhatsAppButton />
      <MobileBottomNav />
      <UIShell />
    </>
  );
}
