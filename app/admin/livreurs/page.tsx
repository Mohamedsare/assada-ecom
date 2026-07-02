import { getDeliveryAgents, getDeliveryAgentStats } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import LivreursContent from "./LivreursContent";

export const metadata = { title: "Livreurs" };
export const dynamic = "force-dynamic";

export default async function AdminLivreursPage() {
  await requirePermission("delivery", "view");
  const [agents, stats] = await Promise.all([getDeliveryAgents(), getDeliveryAgentStats()]);
  return <LivreursContent agents={agents} stats={stats} />;
}
