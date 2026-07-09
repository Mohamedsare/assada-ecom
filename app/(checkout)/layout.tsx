import UIShell from "@/components/layout/UIShell";
import ConfigHydrator from "@/components/layout/ConfigHydrator";
import { getStoreConfig } from "@/lib/supabase/queries";

/**
 * Layout dépouillé pour le tunnel de commande : pas de header ni de footer du site,
 * juste le contenu du checkout (façon page de paiement dédiée). On conserve
 * ConfigHydrator (frais de livraison réglés en admin) et UIShell (panier / toasts).
 */
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getStoreConfig();
  return (
    <>
      <ConfigHydrator deliveryFee={config.deliveryFee} freeDeliveryThreshold={config.freeDeliveryThreshold} />
      <main className="flex-1">{children}</main>
      <UIShell />
    </>
  );
}
