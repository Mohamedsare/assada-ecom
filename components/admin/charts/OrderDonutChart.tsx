"use client";

const SIZE = 150;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

const STATUS_COLORS: Record<string, string> = {
  pending: "#F97316",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  shipped: "#06b6d4",
  out_for_delivery: "#f59e0b",
  delivered: "#020B27",
  cancelled: "#EF4444",
  returned: "#94a3b8",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmées",
  preparing: "En préparation",
  shipped: "Expédiées",
  out_for_delivery: "En livraison",
  delivered: "Livrées",
  cancelled: "Annulées",
  returned: "Retournées",
};

interface Props {
  statusCounts?: Record<string, number>;
}

export default function OrderDonutChart({ statusCounts }: Props) {
  const segments = Object.keys(STATUS_COLORS)
    .map((key) => ({
      key,
      label: STATUS_LABELS[key],
      value: statusCounts?.[key] ?? 0,
      color: STATUS_COLORS[key],
    }))
    .filter((s) => s.value > 0);

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-8">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE}>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-[#020B27]">0</span>
            <span className="text-xs text-text-secondary">Total</span>
          </div>
        </div>
        <p className="text-xs text-text-secondary">Aucune commande enregistrée</p>
      </div>
    );
  }

  let offset = 0;

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {segments.map((seg) => {
            const dash = (seg.value / total) * CIRC;
            const circle = (
              <circle
                key={seg.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${CIRC - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-[#020B27]">{total}</span>
          <span className="text-xs text-text-secondary">Total</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-text-secondary">{seg.label}</span>
            </div>
            <span className="font-medium text-[#020B27] shrink-0 whitespace-nowrap">
              {seg.value}{" "}
              <span className="text-text-secondary font-normal">
                ({Math.round((seg.value / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
