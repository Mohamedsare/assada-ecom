"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import HomeFooter from "./HomeFooter";

// L'accueil utilise un footer enrichi (HomeFooter) ; les autres pages
// publiques utilisent le footer standard. Centralisé ici pour que le layout
// (public) reste la seule source du chrome partagé.
export default function SiteFooter() {
  const pathname = usePathname();
  return pathname === "/" ? <HomeFooter /> : <Footer />;
}
