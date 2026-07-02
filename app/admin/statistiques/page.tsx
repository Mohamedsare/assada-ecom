import type { Metadata } from "next";
import { DollarSign, ShoppingBag, Users, TrendingUp, MapPin, Package, Tag, CreditCard } from "lucide-react";
import { getAdminOrders, getAdminProducts, getAdminStats } from "@/lib/supabase/queries";
import { requirePermission } from "@/lib/supabase/guards";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS, ORDER_STATUS_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Rapports & Statistiques" };
export const dynamic = "force-dynamic";

const FR_MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

export default async function AdminStatsPage() {
  await requirePermission("dashboard", "view");
  const [stats, orders, products] = await Promise.all([
    getAdminStats(),
    getAdminOrders(),
    getAdminProducts(),
  ]);

  const now = new Date();

  // CA mensuel (12 mois) — commandes livrées
  const monthly = new Array(12).fill(0) as number[];
  const monthLabels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(FR_MONTHS[d.getMonth()]);
  }
  for (const o of orders) {
    if (o.order_status !== "delivered") continue;
    const d = new Date(o.created_at);
    for (let i = 11; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth()) {
        monthly[11 - i] += o.total_amount ?? 0;
        break;
      }
    }
  }

  // Top produits (quantité vendue) + meilleures catégories (CA)
  const productQty = new Map<string, { name: string; qty: number; revenue: number }>();
  const catRevenue = new Map<string, number>();
  const productCat = new Map(products.map((p) => [p.id, p.category?.name ?? "Sans catégorie"]));

  for (const o of orders) {
    // Une commande annulée ou retournée n'est pas une vente : on l'exclut des agrégats produits/catégories.
    if (o.order_status === "cancelled" || o.order_status === "returned") continue;
    for (const it of o.items ?? []) {
      const cur = productQty.get(it.product_name) ?? { name: it.product_name, qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += it.total_price;
      productQty.set(it.product_name, cur);
      const cat = (it.product_id && productCat.get(it.product_id)) || "Sans catégorie";
      catRevenue.set(cat, (catRevenue.get(cat) ?? 0) + it.total_price);
    }
  }
  const topProducts = [...productQty.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const topCategories = [...catRevenue.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Top villes (nb commandes)
  const cityCount = new Map<string, number>();
  for (const o of orders) cityCount.set(o.delivery_city, (cityCount.get(o.delivery_city) ?? 0) + 1);
  const topCities = [...cityCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Répartition paiement + statut
  const payCount = countBy(orders, (o) => o.payment_method);
  const statusCount = countBy(orders, (o) => o.order_status);

  const maxMonthly = Math.max(...monthly, 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#020B27]">Rapports & Statistiques</h1>
        <p className="text-text-secondary text-sm mt-0.5">Analyse des performances de la boutique</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={DollarSign} label="Chiffre d'affaires (livré)" value={formatPrice(stats.totalRevenue)} color="text-green bg-green-50" />
        <Kpi icon={ShoppingBag} label="Commandes totales" value={String(stats.totalOrders)} color="text-blue-600 bg-blue-50" />
        <Kpi icon={TrendingUp} label="Panier moyen" value={formatPrice(stats.avgOrderValue)} color="text-purple-600 bg-purple-50" />
        <Kpi icon={Users} label="Clients" value={String(stats.totalCustomers)} color="text-orange-600 bg-orange-50" />
      </div>

      {/* CA mensuel */}
      <Card title="Évolution du chiffre d'affaires" subtitle="12 derniers mois — commandes livrées">
        <div className="flex items-end gap-2 h-44 pt-4">
          {monthly.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <span className="text-[9px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{Math.round(v / 1000)}K</span>
              <div className="w-full bg-green/15 rounded-t-md relative" style={{ height: `${Math.max((v / maxMonthly) * 100, 2)}%` }}>
                <div className="absolute inset-0 bg-green rounded-t-md" style={{ opacity: v > 0 ? 1 : 0 }} />
              </div>
              <span className="text-[10px] text-text-secondary">{monthLabels[i]}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top produits */}
        <Card title="Top produits" subtitle="Par quantité vendue" icon={Package}>
          <RankList
            empty="Aucune vente"
            rows={topProducts.map((p) => ({ label: p.name, sub: `${p.qty} vendus`, value: formatPrice(p.revenue) }))}
          />
        </Card>

        {/* Meilleures catégories */}
        <Card title="Meilleures catégories" subtitle="Par chiffre d'affaires" icon={Tag}>
          <RankList
            empty="Aucune donnée"
            rows={topCategories.map(([name, rev]) => ({ label: name, value: formatPrice(rev) }))}
          />
        </Card>

        {/* Top villes */}
        <Card title="Top villes" subtitle="Par nombre de commandes" icon={MapPin}>
          <RankList
            empty="Aucune commande"
            rows={topCities.map(([city, n]) => ({ label: city, value: `${n} cmd` }))}
          />
        </Card>

        {/* Paiement + statut */}
        <Card title="Répartition" subtitle="Paiement & statut des commandes" icon={CreditCard}>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-1">Moyens de paiement</p>
            {PAYMENT_METHODS.map((m) => (
              <Bar key={m.id} label={`${m.icon} ${m.label}`} value={payCount[m.id] ?? 0} total={orders.length} />
            ))}
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-1 mt-3">Statut des commandes</p>
            {Object.entries(statusCount).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
              <Bar key={s} label={ORDER_STATUS_LABELS[s] ?? s} value={n} total={orders.length} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function countBy<T>(arr: T[], key: (x: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of arr) { const k = key(x); out[k] = (out[k] ?? 0) + 1; }
  return out;
}

function Kpi({ icon: Icon, label, value, color }: { icon: typeof DollarSign; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-[#020B27] leading-none truncate">{value}</p>
        <p className="text-xs text-text-secondary mt-1">{label}</p>
      </div>
    </div>
  );
}

function Card({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: typeof Package; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={16} className="text-green" />}
        <div>
          <h3 className="font-bold text-[#020B27] text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function RankList({ rows, empty }: { rows: { label: string; sub?: string; value: string }[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-text-secondary text-center py-6">{empty}</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#020B27] truncate">{r.label}</p>
            {r.sub && <p className="text-[11px] text-text-secondary">{r.sub}</p>}
          </div>
          <span className="text-sm font-bold text-green shrink-0">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-[#020B27]">{value} · {pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-green rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
