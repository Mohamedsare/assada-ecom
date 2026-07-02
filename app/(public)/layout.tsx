import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/layout/SiteFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import UIShell from "@/components/layout/UIShell";
import ConfigHydrator from "@/components/layout/ConfigHydrator";
import { getStoreConfig, getPageImages } from "@/lib/supabase/queries";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, images] = await Promise.all([getStoreConfig(), getPageImages()]);
  return (
    <>
      <ConfigHydrator deliveryFee={config.deliveryFee} freeDeliveryThreshold={config.freeDeliveryThreshold} images={images} />
      <TopBar />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
      <MobileBottomNav />
      <UIShell />
    </>
  );
}
