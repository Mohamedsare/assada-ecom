import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ArrowUp,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Package,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getAdminStats, getAdminOrders, getAdminProducts } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import { ORDER_STATUS_LABELS, ORDER_CHANNEL_LABELS } from "@/lib/constants";
import SalesAreaChart, { type SalesChartData } from "@/components/admin/charts/SalesAreaChart";
import OrderDonutChart from "@/components/admin/charts/OrderDonutChart";
import DeliveryTrackingCard from "@/components/admin/DeliveryTrackingCard";
import DashboardToolbar from "@/components/admin/DashboardToolbar";
import type { Order } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  pending:          "bg-yellow-50 text-yellow-700",
  confirmed:        "bg-blue-50 text-blue-700",
  preparing:        "bg-purple-50 text-purple-700",
  shipped:          "bg-indigo-50 text-indigo-700",
  out_for_delivery: "bg-orange-50 text-orange-700",
  delivered:        "bg-green-50 text-[#020B27]",
  cancelled:        "bg-red-50 text-red-700",
  returned:         "bg-gray-50 text-gray-700",
};

export const metadata = { title: "Tableau de bord admin" };
export const dynamic = "force-dynamic";

const FR_MONTHS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];
const FR_DAYS   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

function buildSalesChartData(orders: Order[]): SalesChartData {
  const now = new Date();
  const toM = (v: number) => Math.round((v / 1_000_000) * 100) / 100;

  // Mois: 12 derniers mois
  const monthTotals = new Array(12).fill(0) as number[];
  const monthLabels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(FR_MONTHS[d.getMonth()]);
  }

  // Jour: 7 derniers jours
  const dayTotals = new Array(7).fill(0) as number[];
  const dayLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayLabels.push(FR_DAYS[d.getDay()]);
  }

  // Semaine: 4 dernières semaines
  const weekTotals = new Array(4).fill(0) as number[];
  const weekLabels = ["S-3", "S-2", "S-1", "Cette sem."];

  for (const order of orders) {
    const amount = order.total_amount ?? 0;
    const orderDate = new Date(order.created_at);

    // Mois
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (orderDate.getFullYear() === d.getFullYear() && orderDate.getMonth() === d.getMonth()) {
        monthTotals[11 - i] += amount;
        break;
      }
    }

    // Jour
    const daysAgo = Math.floor((now.getTime() - orderDate.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 7) dayTotals[6 - daysAgo] += amount;

    // Semaine
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo >= 0 && weeksAgo < 4) weekTotals[3 - weeksAgo] += amount;
  }

  return {
    Mois:    monthLabels.map((label, i) => ({ label, value: toM(monthTotals[i]) })),
    Semaine: weekLabels.map((label, i)  => ({ label, value: toM(weekTotals[i]) })),
    Jour:    dayLabels.map((label, i)   => ({ label, value: toM(dayTotals[i]) })),
  };
}

function buildStatusCounts(orders: Order[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const order of orders) {
    counts[order.order_status] = (counts[order.order_status] ?? 0) + 1;
  }
  return counts;
}

/** CA encaissé (commandes livrées) du jour et du mois en cours. */
function revenueTodayMonth(orders: Order[]): { today: number; month: number } {
  const now = new Date();
  let today = 0, month = 0;
  for (const o of orders) {
    if (o.order_status !== "delivered") continue;
    const d = new Date(o.created_at);
    const amount = o.total_amount ?? 0;
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      month += amount;
      if (d.getDate() === now.getDate()) today += amount;
    }
  }
  return { today, month };
}

/** Répartition des commandes par canal (site / whatsapp / boutique). */
function channelCounts(orders: Order[]): Record<string, number> {
  const counts: Record<string, number> = { site: 0, whatsapp: 0, store: 0 };
  for (const o of orders) counts[o.channel ?? "site"] = (counts[o.channel ?? "site"] ?? 0) + 1;
  return counts;
}

/** Top quartiers par nombre de commandes. */
function topDistricts(orders: Order[], limit = 5): { district: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const o of orders) {
    const d = o.delivery_district?.trim();
    if (d) counts[d] = (counts[d] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Chiffre d'affaires et nombre de commandes par mois (12 derniers mois). */
function monthlySeries(orders: Order[]): { revenue: number[]; counts: number[] } {
  const now = new Date();
  const revenue = new Array(12).fill(0) as number[];
  const counts = new Array(12).fill(0) as number[];
  for (const order of orders) {
    const d = new Date(order.created_at);
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth()) {
        revenue[11 - i] += order.total_amount ?? 0;
        counts[11 - i] += 1;
        break;
      }
    }
  }
  return { revenue, counts };
}

/** Convertit une série de valeurs en points pour une sparkline (viewBox 200x40). */
function sparklinePoints(values: number[], width = 200, height = 40, pad = 5): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const x = Math.round(i * step);
      const y = Math.round(height - pad - ((v - min) / range) * (height - pad * 2));
      return `${x},${y}`;
    })
    .join(" ");
}

export default async function AdminDashboardPage() {
  await requirePermission("dashboard", "view");
  const [stats, allOrders, allProducts] = await Promise.all([
    getAdminStats(),
    getAdminOrders(),
    getAdminProducts(),
  ]);

  const recentOrders = allOrders.slice(0, 5);
  const lowStock = allProducts
    .filter((p) => p.stock_quantity < 5 && p.status === "active")
    .slice(0, 5);
  const recentDelivery = allOrders.find((o) => o.order_status === "out_for_delivery") ?? null;

  const salesChartData = buildSalesChartData(allOrders);
  const statusCounts   = buildStatusCounts(allOrders);
  const series         = monthlySeries(allOrders);
  const revenueSpark   = sparklinePoints(series.revenue);
  const ordersSpark    = sparklinePoints(series.counts);

  const { today: revenueToday, month: revenueMonth } = revenueTodayMonth(allOrders);
  const channels = channelCounts(allOrders);
  const districts = topDistricts(allOrders);
  const validatedCount = allOrders.filter(
    (o) => o.order_status !== "pending" && o.order_status !== "cancelled" && o.order_status !== "returned",
  ).length;
  const validationRate = stats.totalOrders ? Math.round((validatedCount / stats.totalOrders) * 100) : 0;
  const cancellationRate = stats.totalOrders ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0;
  const maxDistrict = districts[0]?.count ?? 1;

  const deliveryRate = stats.totalOrders ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0;
  const report = [
    { label: "Ventes totales", value: formatPrice(stats.totalRevenue) },
    { label: "Commandes totales", value: String(stats.totalOrders) },
    { label: "Commandes en attente", value: String(stats.pendingOrders) },
    { label: "Commandes livrées", value: String(stats.deliveredOrders) },
    { label: "Commandes annulées", value: String(stats.cancelledOrders) },
    { label: "Clients", value: String(stats.totalCustomers) },
    { label: "Panier moyen", value: formatPrice(stats.avgOrderValue) },
    { label: "Taux de livraison", value: `${deliveryRate}%` },
    { label: "Produits en stock faible", value: String(stats.lowStockCount) },
  ];

  return (
    <div className="space-y-4 text-[13px]" style={{ zoom: 0.65 }}>
      {/* Barre période / export */}
      <DashboardToolbar report={report} />

      {/* KPI — 2 cards graphiques + 4 cards stats */}
      <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 items-stretch">
        {/* Ventes totales */}
        <div className="col-span-2 bg-linear-to-br from-[#0f2557] to-[#1d4ed8] rounded-lg p-4 text-white relative overflow-hidden">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-blue-200 text-xs">Ventes totales</p>
              <p className="text-xl font-extrabold mt-1">
                {Math.round(stats.totalRevenue / 1000)}K{" "}
                <span className="text-xs font-medium text-blue-200">DH</span>
              </p>
              <p className="text-[11px] text-green-light flex items-center gap-0.5 mt-1">
                <ArrowUp size={10} /> Commandes livrées seulement
              </p>
            </div>
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <svg viewBox="0 0 200 40" className="w-full h-7 mt-1" preserveAspectRatio="none">
            <polyline points={revenueSpark} fill="none" stroke="#93c5fd" strokeWidth="2" />
          </svg>
        </div>

        {/* Commandes totales */}
        <div className="col-span-2 bg-linear-to-br from-[#0d5c2e] to-green rounded-lg p-4 text-white relative overflow-hidden">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-green-100 text-xs">Commandes totales</p>
              <p className="text-xl font-extrabold mt-1">{stats.totalOrders}</p>
              <p className="text-[11px] text-green-100 flex items-center gap-0.5 mt-1">
                <ArrowUp size={10} /> {stats.deliveredOrders} livrées · {stats.pendingOrders} en attente
              </p>
            </div>
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <svg viewBox="0 0 200 40" className="w-full h-7 mt-1" preserveAspectRatio="none">
            <polyline points={ordersSpark} fill="none" stroke="#bbf7d0" strokeWidth="2" />
          </svg>
        </div>

        {/* En attente */}
        <StatCard icon={Clock} iconColor="text-orange-600 bg-orange-50" value={String(stats.pendingOrders)} label="En attente" sub="À traiter" />
        {/* Livrées */}
        <StatCard icon={CheckCircle2} iconColor="text-green bg-green-50" value={String(stats.deliveredOrders)} label="Livrées" trend={`${stats.totalOrders ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}% succès`} />
        {/* Annulées */}
        <StatCard icon={XCircle} iconColor="text-red-600 bg-red-50" value={String(stats.cancelledOrders)} label="Annulées" sub={`${stats.totalOrders ? Math.round((stats.cancelledOrders / stats.totalOrders) * 100) : 0}% du total`} />
        {/* Clients actifs */}
        <StatCard icon={Users} iconColor="text-blue-600 bg-blue-50" value={String(stats.totalCustomers)} label="Clients" sub="Inscrits" />
      </div>

      {/* Graphiques + commandes récentes */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <SalesAreaChart data={salesChartData} />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col">
          <h3 className="font-bold text-[#020B27] text-sm mb-3">Statut des commandes</h3>
          <div className="flex-1 flex items-center">
            <OrderDonutChart statusCounts={statusCounts} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-[#020B27] text-sm">Commandes récentes</h3>
            <Link href="/admin/commandes" className="text-xs text-green hover:underline">Voir toutes</Link>
          </div>
          <div className="p-3 space-y-1">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-6">Aucune commande</p>
            ) : (
              recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/commandes/${o.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <ShoppingBag size={15} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#020B27] truncate">{o.order_number}</p>
                    <p className="text-[11px] text-text-secondary truncate">{o.customer_name} · {o.delivery_city}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[o.order_status] ?? "bg-gray-50 text-gray-700"}`}>
                      {ORDER_STATUS_LABELS[o.order_status]}
                    </span>
                    <p className="text-[10px] text-text-secondary mt-1">{formatDate(o.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top produits + stock faible */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Produits récents */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-[#020B27] text-sm">Produits récents</h3>
            <Link href="/admin/produits" className="text-xs text-green hover:underline">Voir tout</Link>
          </div>
          <div className="p-3 space-y-1">
            {allProducts.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/admin/produits/${p.id}/modifier`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {p.main_image_url ? (
                    <Image src={p.main_image_url} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <Package size={15} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#020B27] truncate">{p.name}</p>
                  <p className="text-[11px] text-text-secondary">{p.category?.name ?? "—"}</p>
                </div>
                <span className="text-sm font-bold text-green shrink-0">{formatPrice(p.current_price)}</span>
              </Link>
            ))}
            {allProducts.length === 0 && (
              <p className="text-xs text-text-secondary text-center py-6">Aucun produit</p>
            )}
          </div>
        </div>

        {/* Alertes stock faible */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-[#020B27] text-sm">Alertes stock faible</h3>
            <Link href="/admin/produits" className="text-xs text-green hover:underline">Voir tout</Link>
          </div>
          <div className="p-3 space-y-1">
            {lowStock.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-6">Aucune alerte</p>
            ) : (
              lowStock.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/produits/${s.id}/modifier`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {s.main_image_url ? (
                      <Image src={s.main_image_url} alt={s.name} width={36} height={36} className="object-cover w-full h-full" />
                    ) : (
                      <Package size={15} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#020B27] truncate">{s.name}</p>
                    <p className="text-[11px] text-text-secondary">Stock : {s.stock_quantity} unités</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Faible</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CA jour/mois + taux (spec ASSADA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} iconColor="text-green bg-green-50" value={formatPrice(revenueToday)} label="CA du jour" sub="Commandes livrées" />
        <StatCard icon={TrendingUp} iconColor="text-blue-600 bg-blue-50" value={formatPrice(revenueMonth)} label="CA du mois" sub="Commandes livrées" />
        <StatCard icon={CheckCircle2} iconColor="text-green bg-green-50" value={`${validationRate}%`} label="Taux de validation" sub={`${validatedCount} validées`} />
        <StatCard icon={XCircle} iconColor="text-red-600 bg-red-50" value={`${cancellationRate}%`} label="Taux d'annulation" sub={`${stats.cancelledOrders} annulées`} />
      </div>

      {/* Canal + quartiers (spec ASSADA) */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-[#020B27] text-sm mb-3">Commandes par canal</h3>
          <div className="space-y-2">
            {Object.entries(ORDER_CHANNEL_LABELS).map(([key, label]) => {
              const count = channels[key] ?? 0;
              const pct = stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-medium text-[#020B27]">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-[#020B27] text-sm mb-3">Quartiers qui commandent le plus</h3>
          {districts.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-6">Aucune commande</p>
          ) : (
            <div className="space-y-2">
              {districts.map((d) => (
                <div key={d.district}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#020B27] flex items-center gap-1"><MapPin size={11} className="text-gray-400" /> {d.district}</span>
                    <span className="font-medium text-text-secondary">{d.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1d4ed8] rounded-full" style={{ width: `${Math.round((d.count / maxDistrict) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suivi livraison */}
      <DeliveryTrackingCard recentDelivery={recentDelivery} />

      {/* Stats bas */}
      <div className="bg-night rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { icon: Users, label: "Total clients", value: String(stats.totalCustomers), color: "text-blue-300" },
          { icon: ShieldCheck, label: "Panier moyen", value: `${Math.round(stats.avgOrderValue / 1000)}K`, suffix: "DH", color: "text-green-light" },
          { icon: TrendingUp, label: "Taux de livraison", value: `${stats.totalOrders ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%`, color: "text-purple-300" },
          { icon: MapPin, label: "Stock faible", value: String(stats.lowStockCount), color: "text-red-300" },
          { icon: CheckCircle2, label: "Taux succès", value: `${stats.totalOrders ? Math.round(((stats.totalOrders - stats.cancelledOrders) / stats.totalOrders) * 100) : 0}%`, color: "text-green-light" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-white text-lg font-extrabold leading-none">
                  {s.value}
                  {"suffix" in s && s.suffix && (
                    <span className="text-xs font-medium text-gray-400 ml-1">{s.suffix}</span>
                  )}
                </p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  sub,
  trend,
}: {
  icon: typeof Clock;
  iconColor: string;
  value: string;
  label: string;
  sub?: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3.5 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-text-secondary">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-xl font-extrabold text-[#020B27] mt-auto">{value}</p>
      {sub && <p className="text-[11px] text-text-secondary mt-1">{sub}</p>}
      {trend && <p className="text-[11px] text-green flex items-center gap-0.5 mt-1"><ArrowUp size={10} /> {trend}</p>}
    </div>
  );
}
