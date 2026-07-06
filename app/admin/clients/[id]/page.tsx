import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, User, MapPin, ShoppingBag, MessageCircle, Calendar,
} from "lucide-react";
import { getProfileById, getUserOrders, getUserAddresses } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import { formatPrice, formatDate, getClientWhatsAppUrl } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Fiche client" };

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-blue-100 text-blue-700",
  preparing:        "bg-purple-100 text-purple-700",
  shipped:          "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered:        "bg-green-100 text-[#020B27]",
  cancelled:        "bg-red-100 text-red-700",
  returned:         "bg-gray-100 text-gray-700",
};

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("clients", "view");
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const [orders, addresses] = await Promise.all([getUserOrders(id), getUserAddresses(id)]);

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Utilisateur";
  const initials = displayName.slice(0, 2).toUpperCase();
  const delivered = orders.filter((o) => o.order_status === "delivered");
  const totalSpent = delivered.reduce((s, o) => s + (o.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/clients" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#020B27] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-green rounded-full flex items-center justify-center text-[#020B27] font-bold shrink-0">{initials}</div>
            <div>
              <h1 className="text-2xl font-bold text-[#020B27]">{displayName}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${profile.is_active ? "bg-green-50 text-green" : "bg-red-50 text-red-600"}`}>
                {profile.is_active ? "Compte actif" : "Compte bloqué"}
              </span>
            </div>
          </div>
        </div>
        {profile.phone && (
          <Link
            href={getClientWhatsAppUrl(profile.phone, `Bonjour ${profile.first_name ?? ""}, ici RYTA.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 text-[#020B27] text-sm font-medium px-4 py-2.5 rounded-lg hover:border-[#B8925A] hover:text-[#B8925A] transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp
          </Link>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Commandes" value={String(orders.length)} />
        <StatCard label="Livrées" value={String(delivered.length)} />
        <StatCard label="Total dépensé" value={formatPrice(totalSpent)} tone="green" />
        <StatCard label="Adresses" value={String(addresses.length)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Commandes */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Historique des commandes" icon={<ShoppingBag size={16} />}>
            {orders.length === 0 ? (
              <p className="text-sm text-text-secondary py-4 text-center">Ce client n&apos;a pas encore passé de commande.</p>
            ) : (
              <div className="divide-y divide-gray-50 -my-2">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/commandes/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#020B27]">{o.order_number}</p>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <Calendar size={11} /> {formatDate(o.created_at)} · {o.items?.length ?? 0} article(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[o.order_status]}`}>
                        {ORDER_STATUS_LABELS[o.order_status]}
                      </span>
                      <span className="text-sm font-bold text-[#020B27]">{formatPrice(o.total_amount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Infos + adresses */}
        <div className="space-y-6">
          <Card title="Coordonnées" icon={<User size={16} />}>
            <InfoLine icon={<User size={13} />} value={displayName} />
            {profile.email && <InfoLine icon={<Mail size={13} />} value={profile.email} />}
            <InfoLine icon={<Phone size={13} />} value={profile.phone ?? "—"} />
            <InfoLine icon={<Calendar size={13} />} value={`Inscrit le ${formatDate(profile.created_at)}`} />
          </Card>

          <Card title={`Adresses (${addresses.length})`} icon={<MapPin size={16} />}>
            {addresses.length === 0 ? (
              <p className="text-sm text-text-secondary">Aucune adresse enregistrée.</p>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="text-sm border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#020B27]">{a.full_name}</p>
                    {a.is_default && <span className="text-[10px] bg-green-50 text-green px-1.5 py-0.5 rounded-full font-medium">Par défaut</span>}
                  </div>
                  <p className="text-text-secondary">{a.phone}</p>
                  <p className="text-text-secondary">{a.city}, {a.district}</p>
                  {a.address_details && <p className="text-text-secondary">{a.address_details}</p>}
                  {a.landmark && <p className="text-xs text-text-secondary italic">Repère : {a.landmark}</p>}
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-[#020B27] mb-4 flex items-center gap-2">
        {icon && <span className="text-green">{icon}</span>}{title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoLine({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#020B27]">
      <span className="text-gray-400">{icon}</span>{value}
    </div>
  );
}

function StatCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "green" }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p className={`text-xl font-bold ${tone === "green" ? "text-[#020B27]" : "text-[#020B27]"}`}>{value}</p>
    </div>
  );
}
