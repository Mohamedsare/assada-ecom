import type { Metadata } from "next";
import { getCurrentProfile, getUserAddresses } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import AdressesContent from "./AdressesContent";

export const metadata: Metadata = { title: "Mes adresses" };

export default async function AdressesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const addresses = await getUserAddresses(profile.id);

  return <AdressesContent initialAddresses={addresses} />;
}
