import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import SiteFooter from "@/components/layout/SiteFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import UIShell from "@/components/layout/UIShell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
