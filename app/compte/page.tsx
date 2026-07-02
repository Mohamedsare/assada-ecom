import type { Metadata } from "next";
import Link from "next/link";
import { Package, Clock, CheckCircle2, Heart, MapPin, ChevronRight } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import {
  getCurrentProfile,
  getUserOrders,
  getUserAddresses,
  getUserWishlist,
} from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Mon compte" };

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  preparing: "bg-purple-50 text-purple-700",
  shipped: "bg-indigo-50 text-indigo-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered: "bg-green-50 text-[#020B27]",
  cancelled: "bg-red-50 text-red-700",
  returned: "bg-gray-50 text-gray-700",
};

export default async function ComptePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const [orders, addresses, wishlist] = await Promise.all([
    getUserOrders(profile.id),
    getUserAddresses(profile.id),
    getUserWishlist(profile.id),
  ]);

  const recentOrders = orders.slice(0, 3);
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled", "returned"].includes(o.order_status)
  );
  const deliveredOrders = orders.filter((o) => o.order_status === "delivered");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Commandes", value: String(orders.length), icon: Package, color: "text-blue-600 bg-blue-50" },
          { label: "En cours", value: String(activeOrders.length), icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "Livrées", value: String(deliveredOrders.length), icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Favoris", value: String(wishlist.length), icon: Heart, color: "text-red-500 bg-red-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-[#020B27]">{stat.value}</p>
              <p className="text-sm text-[#64748B]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#020B27]">Mes dernières commandes</h2>
          <Link href="/compte/commandes" className="text-sm text-[#020B27] hover:underline flex items-center gap-1">
            Voir tout <ChevronRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-[#64748B] text-sm">Aucune commande pour l&apos;instant</p>
            <Link href="/boutique" className="text-sm text-[#020B27] hover:underline mt-2 inline-block">
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={18} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-[#020B27]">{order.order_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.order_status]}`}>
                      {ORDER_STATUS_LABELS[order.order_status]}
                    </span>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-[#64748B] truncate">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[#020B27] text-sm">{formatPrice(order.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address + Personal info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#020B27]">Mes adresses</h2>
            <Link href="/compte/adresses" className="text-sm text-[#020B27] hover:underline">
              Gérer
            </Link>
          </div>
          {defaultAddress ? (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <MapPin size={16} className="text-[#020B27] mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-[#020B27]">{defaultAddress.full_name}</p>
                <p className="text-[#64748B]">{defaultAddress.district}, {defaultAddress.city}</p>
                <p className="text-[#64748B]">{defaultAddress.phone}</p>
                <span className="text-xs text-[#020B27] font-medium">Adresse par défaut</span>
              </div>
            </div>
          ) : (
            <Link
              href="/compte/adresses"
              className="flex items-center gap-2 text-sm text-[#020B27] hover:underline p-3 bg-gray-50 rounded-xl"
            >
              <MapPin size={16} />
              Ajouter une adresse
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#020B27]">Informations personnelles</h2>
            <Link href="/compte/parametres" className="text-sm text-[#020B27] hover:underline">
              Modifier
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Nom</span>
              <span className="font-medium text-[#020B27]">
                {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Email</span>
              <span className="font-medium text-[#020B27] truncate max-w-40">{profile.email ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Téléphone</span>
              <span className="font-medium text-[#020B27]">{profile.phone ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Membre depuis</span>
              <span className="font-medium text-[#020B27]">
                {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
