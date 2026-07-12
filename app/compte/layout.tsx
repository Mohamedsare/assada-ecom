import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import AccountSidebar from "@/components/account/AccountSidebar";
import UIShell from "@/components/layout/UIShell";
import ConfigHydrator from "@/components/layout/ConfigHydrator";
import { getStoreConfig, getNavAxes } from "@/lib/supabase/queries";

export default async function CompteLayout({ children }: { children: React.ReactNode }) {
  const [config, navAxes] = await Promise.all([getStoreConfig(), getNavAxes()]);
  return (
    <>
      <ConfigHydrator deliveryFee={config.deliveryFee} freeDeliveryThreshold={config.freeDeliveryThreshold} />
      <TopBar />
      <Header axes={navAxes} />
      <main className="flex-1 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <AccountSidebar />
            </aside>
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <UIShell />
    </>
  );
}
