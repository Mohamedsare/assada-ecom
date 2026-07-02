import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getCurrentProfile, getUserOrders } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Mes commandes" };

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

export default async function CommandesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const orders = await getUserOrders(profile.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-[#020B27] mb-6">
        Mes commandes ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-lg font-semibold text-[#020B27] mb-2">Aucune commande</p>
          <p className="text-[#64748B] mb-6">Vous n&apos;avez pas encore passé de commande</p>
          <Link
            href="/boutique"
            className="bg-[#B8925A] text-[#020B27] px-6 py-2.5 rounded-xl font-medium hover:bg-[#9E7A45] transition-colors"
          >
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.length ?? 0;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#020B27]">{order.order_number}</h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.order_status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.order_status]}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B]">
                      {formatDate(order.created_at)} · {itemCount} article{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="font-bold text-[#020B27]">{formatPrice(order.total_amount)}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <p className="text-xs text-[#64748B] mb-4 truncate">
                    {order.items.map((i) => i.product_name).join(", ")}
                  </p>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
