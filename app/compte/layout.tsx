import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import AccountSidebar from "@/components/account/AccountSidebar";
import UIShell from "@/components/layout/UIShell";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1 bg-[#F8FAFC] pb-16 lg:pb-0">
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
      <MobileBottomNav />
      <UIShell />
    </>
  );
}
