"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function DashboardToolbar() {
  const [period, setPeriod] = useState("30 derniers jours");
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    // Génère un rapport CSV téléchargeable (démo)
    const rows = [
      ["Indicateur", "Valeur", "Période"],
      ["Ventes totales", "18 450 000 FCFA", period],
      ["Commandes totales", "342", period],
      ["Commandes en attente", "26", period],
      ["Commandes livrées", "268", period],
      ["Commandes annulées", "8", period],
      ["Clients actifs", "1 256", period],
      ["Panier moyen", "54 000 FCFA", period],
      ["Taux de conversion", "4.8%", period],
      ["Taux de livraison", "96.4%", period],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-odms-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {exported && <span className="text-green text-xs font-medium">✓ Rapport téléchargé</span>}
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-green cursor-pointer"
      >
        <option>30 derniers jours</option>
        <option>7 derniers jours</option>
        <option>Cette année</option>
      </select>
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 bg-green hover:bg-[#15803d] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <Download size={14} /> Exporter rapport
      </button>
    </div>
  );
}
