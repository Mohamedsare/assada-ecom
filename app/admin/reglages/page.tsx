import { requireAdmin } from "@/lib/supabase/guards";
import { getPageImages, getHeroSlides } from "@/lib/supabase/queries";
import { PAGE_IMAGE_DEFAULTS } from "@/lib/constants";
import PagesManager from "./PagesManager";

export const metadata = { title: "Gestion des pages" };
export const dynamic = "force-dynamic";

export default async function GestionPagesPage() {
  await requireAdmin();
  const [custom, heroSlides] = await Promise.all([getPageImages(), getHeroSlides()]);
  const images: Record<string, string> = { ...PAGE_IMAGE_DEFAULTS, ...custom };
  return <PagesManager images={images} heroSlides={heroSlides} />;
}
