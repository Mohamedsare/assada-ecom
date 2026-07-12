"use client";

import { createContext, useContext } from "react";

/**
 * Fournit l'URL du logo de la boutique (définie dans Admin → Paramètres) à toute
 * l'application. Alimenté au niveau du layout racine, donc disponible sur
 * absolument toutes les pages (public, compte, admin, auth, checkout, 404…).
 */
const LogoContext = createContext<string>("/ryta.png");

export function LogoProvider({ logoUrl, children }: { logoUrl: string; children: React.ReactNode }) {
  return <LogoContext.Provider value={logoUrl}>{children}</LogoContext.Provider>;
}

/** Renvoie l'URL du logo courant (repli sur le logo par défaut si non défini). */
export function useShopLogo(): string {
  return useContext(LogoContext);
}
