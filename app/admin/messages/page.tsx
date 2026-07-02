import type { Metadata } from "next";
import { getAdminMessages } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import MessagesContent from "./MessagesContent";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requirePermission("clients", "view");
  const messages = await getAdminMessages();
  return <MessagesContent messages={messages} />;
}
