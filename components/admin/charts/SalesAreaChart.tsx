"use client";

import { useState } from "react";

export interface SalesChartPoint {
  label: string;
  value: number; // millions DH
}

export interface SalesChartData {
  Jour: SalesChartPoint[];
  Semaine: SalesChartPoint[];
  Mois: SalesChartPoint[];
}

type Period = keyof SalesChartData;

const W = 720;
const H = 230;
const PAD = { top: 20, right: 20, bottom: 30, left: 50 };

function niceMax(v: number) {
  if (v === 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil((v * 1.25) / mag) * mag;
}

export default function SalesAreaChart({ data }: { data?: SalesChartData }) {
  const [period, setPeriod] = useState<Period>("Mois");

  const fallback: SalesChartData = {
    Jour: Array.from({ length: 7 }, (_, i) => ({ label: `J${i + 1}`, value: 0 })),
    Semaine: Array.from({ length: 4 }, (_, i) => ({ label: `S${i + 1}`, value: 0 })),
    Mois: Array.from({ length: 12 }, (_, i) => ({ label: `M${i + 1}`, value: 0 })),
  };

  const points = (data ?? fallback)[period];
  const maxVal = Math.max(...points.map((p) => p.value));
  const MAX = niceMax(maxVal);
  const isEmpty = maxVal === 0;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const xFn = (i: number) =>
    PAD.left + (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2);
  const yFn = (v: number) => PAD.top + innerH - (v / MAX) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFn(i)} ${yFn(p.value)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${xFn(points.length - 1)} ${PAD.top + innerH} L ${xFn(0)} ${PAD.top + innerH} Z`
      : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(MAX * f * 10) / 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#020B27] text-sm">Évolution des ventes</h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(["Jour", "Semaine", "Mois"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p ? "bg-[#1d4ed8] text-white" : "text-gray-500 hover:text-[#020B27]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8]" />
        <span className="text-xs text-text-secondary">Ventes (DH)</span>
        {isEmpty && (
          <span className="text-xs text-gray-400 ml-2">— Aucune vente enregistrée</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={yFn(t)}
              x2={W - PAD.right}
              y2={yFn(t)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={yFn(t) + 4}
              textAnchor="end"
              className="fill-gray-400"
              fontSize="10"
            >
              {t === 0 ? "0" : t >= 1 ? `${t}M` : `${Math.round(t * 1000)}K`}
            </text>
          </g>
        ))}

        {!isEmpty && <path d={areaPath} fill="url(#salesGradient)" />}
        {!isEmpty && (
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {!isEmpty &&
          points.map((p, i) => (
            <circle
              key={i}
              cx={xFn(i)}
              cy={yFn(p.value)}
              r={4}
              fill="#fff"
              stroke="#2563eb"
              strokeWidth={2.5}
            />
          ))}

        {points.map((p, i) => (
          <text
            key={i}
            x={xFn(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-gray-400"
            fontSize="10"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
