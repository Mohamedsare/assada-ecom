"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export interface ReportRow {
  label: string;
  value: string;
}

export default function DashboardToolbar({ report }: { report: ReportRow[] }) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    // Rapport CSV à partir des indicateurs réels du tableau de bord.
    const rows = [
      ["Indicateur", "Valeur"],
      ...report.map((r) => [r.label, r.value]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-ryta-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 bg-green hover:bg-[#9E7A45] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <Download size={14} /> Exporter rapport
      </button>
    </div>
  );
}
