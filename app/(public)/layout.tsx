import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/layout/SiteFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import UIShell from "@/components/layout/UIShell";
import ConfigHydrator from "@/components/layout/ConfigHydrator";
import { getStoreConfig, getPageImages, getHeroSlides } from "@/lib/supabase/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, images, heroSlides] = await Promise.all([getStoreConfig(), getPageImages(), getHeroSlides()]);
  return (
    <>
      <ConfigHydrator deliveryFee={config.deliveryFee} freeDeliveryThreshold={config.freeDeliveryThreshold} images={images} heroSlides={heroSlides} />
      <TopBar />
      <Header />
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
