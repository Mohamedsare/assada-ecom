"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Wand2, X } from "lucide-react";
import type { ProductVariant } from "@/types";

interface VariantRow {
  key: string;
  color: string;
  size: string;
  stock_quantity: string;
  price_adjustment: string;
}

let keySeq = 0;
const newKey = () => `v${++keySeq}-${Date.now()}`;

// ─── Couleurs : nom (FR) → hex pour la pastille ───────────────────────────────
const COLOR_MAP: Record<string, string> = {
  noir: "#111827", blanc: "#FFFFFF", gris: "#9CA3AF", "gris clair": "#D1D5DB",
  rouge: "#EF4444", bordeaux: "#7F1D1D", rose: "#EC4899", orange: "#F97316",
  jaune: "#FACC15", or: "#D4AF37", ore: "#D4AF37", dore: "#D4AF37",
  vert: "#16A34A", "vert clair": "#22C55E", kaki: "#556B2F", turquoise: "#14B8A6",
  bleu: "#3B82F6", "bleu clair": "#60A5FA", "bleu nuit": "#020617", marine: "#1E3A5F",
  violet: "#8B5CF6", mauve: "#C084FC", marron: "#92400E", beige: "#E7D3B3",
  argent: "#C0C0C0", "gris fonce": "#4B5563", creme: "#F5F0E1", camel: "#C19A6B",
};

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function colorSwatch(name: string): string | null {
  return COLOR_MAP[normalize(name)] ?? null;
}

// ─── Presets de tailles ───────────────────────────────────────────────────────
const SIZE_PRESETS: { label: string; sizes: string[] }[] = [
  { label: "Chaussures H (40-46)", sizes: ["40", "41", "42", "43", "44", "45", "46"] },
  { label: "Chaussures F (36-41)", sizes: ["36", "37", "38", "39", "40", "41"] },
  { label: "Vêtements (XS-XXL)", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "Taille unique", sizes: ["Unique"] },
];

function toRow(v: ProductVariant): VariantRow {
  return {
    key: newKey(),
    color: v.color ?? "",
    size: v.size ?? "",
    stock_quantity: String(v.stock_quantity ?? 0),
    price_adjustment: String(v.price_adjustment ?? 0),
  };
}

/**
 * Gestionnaire de variantes « pro » :
 *  - Couleurs (pastilles) + Tailles (chips + presets) → génération de la matrice.
 *  - Tableau stock / ajustement de prix par variante.
 *  - Sérialisé en JSON dans un input caché `name` (contrat inchangé côté serveur).
 */
export default function VariantsField({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: ProductVariant[];
}) {
  const initial = (defaultValue ?? []).map(toRow);
  const [rows, setRows] = useState<VariantRow[]>(initial);

  // Chips dérivées : au chargement, on récupère couleurs/tailles existantes.
  const [colors, setColors] = useState<string[]>(
    [...new Set(initial.map((r) => r.color).filter(Boolean))]
  );
  const [sizes, setSizes] = useState<string[]>(
    [...new Set(initial.map((r) => r.size).filter(Boolean))]
  );
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  // ── Chips ───────────────────────────────────────────────────────────────────
  const addChip = (kind: "color" | "size", raw: string) => {
    const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
    if (!values.length) return;
    const setter = kind === "color" ? setColors : setSizes;
    setter((prev) => {
      const next = [...prev];
      for (const v of values) {
        if (!next.some((x) => normalize(x) === normalize(v))) next.push(v);
      }
      return next;
    });
  };
  const removeChip = (kind: "color" | "size", val: string) => {
    (kind === "color" ? setColors : setSizes)((prev) => prev.filter((x) => x !== val));
  };
  const addPreset = (preset: string[]) => {
    setSizes((prev) => {
      const next = [...prev];
      for (const v of preset) if (!next.some((x) => normalize(x) === normalize(v))) next.push(v);
      return next;
    });
  };

  const chipKeyDown = (kind: "color" | "size") => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = kind === "color" ? colorInput : sizeInput;
      addChip(kind, val);
      (kind === "color" ? setColorInput : setSizeInput)("");
    }
  };

  // ── Génération de la matrice (préserve stock/prix des variantes existantes) ──
  const combos = useMemo(() => {
    const c = colors.length ? colors : [""];
    const s = sizes.length ? sizes : [""];
    const list: { color: string; size: string }[] = [];
    for (const col of c) for (const sz of s) list.push({ color: col, size: sz });
    return list.filter((x) => x.color || x.size);
  }, [colors, sizes]);

  const generate = () => {
    if (!combos.length) return;
    const prevByKey = new Map(
      rows.map((r) => [`${normalize(r.color)}|${normalize(r.size)}`, r])
    );
    setRows(
      combos.map(({ color, size }) => {
        const existing = prevByKey.get(`${normalize(color)}|${normalize(size)}`);
        return existing
          ? { ...existing, color, size }
          : { key: newKey(), color, size, stock_quantity: "0", price_adjustment: "0" };
      })
    );
  };

  // ── Lignes ────────────────────────────────────────────────────────────────
  const update = (key: string, field: keyof VariantRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const remove = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));
  const addManual = () =>
    setRows((prev) => [...prev, { key: newKey(), color: "", size: "", stock_quantity: "0", price_adjustment: "0" }]);
  const clearAll = () => setRows([]);

  const totalStock = rows.reduce((s, r) => s + (Number(r.stock_quantity) || 0), 0);

  // ── Sérialisation ────────────────────────────────────────────────────────────
  const serialized = JSON.stringify(
    rows
      .filter((r) => r.color.trim() || r.size.trim())
      .map((r) => ({
        color: r.color.trim(),
        size: r.size.trim(),
        stock_quantity: Number(r.stock_quantity) || 0,
        price_adjustment: Number(r.price_adjustment) || 0,
      }))
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={serialized} />

      {/* Couleurs */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Couleurs</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {colors.map((c) => {
            const hex = colorSwatch(c);
            return (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 pl-1.5 pr-2 py-1 text-xs">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0"
                  style={hex ? { background: hex } : { background: "conic-gradient(#f87171,#facc15,#4ade80,#60a5fa,#c084fc,#f87171)" }}
                  title={hex ? undefined : "Couleur non reconnue (pastille générique)"}
                />
                {c}
                <button type="button" onClick={() => removeChip("color", c)} className="text-gray-400 hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
        <input
          value={colorInput}
          onChange={(e) => setColorInput(e.target.value)}
          onKeyDown={chipKeyDown("color")}
          onBlur={() => { if (colorInput.trim()) { addChip("color", colorInput); setColorInput(""); } }}
          placeholder="Noir, Blanc, Rouge…  (Entrée pour ajouter)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors"
        />
      </div>

      {/* Tailles */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Tailles</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p.sizes)}
              className="rounded-full bg-[#F8FAFC] border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-[#0F172A] hover:border-green hover:text-green transition-colors"
            >
              + {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {sizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium">
              {s}
              <button type="button" onClick={() => removeChip("size", s)} className="text-gray-400 hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value)}
          onKeyDown={chipKeyDown("size")}
          onBlur={() => { if (sizeInput.trim()) { addChip("size", sizeInput); setSizeInput(""); } }}
          placeholder="42, 43, M, L…  (Entrée pour ajouter)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors"
        />
      </div>

      {/* Générer */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={generate}
          disabled={!combos.length}
          className="inline-flex items-center gap-1.5 bg-[#020617] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Wand2 size={14} /> Générer les variantes{combos.length ? ` (${combos.length})` : ""}
        </button>
        {rows.length > 0 && (
          <button type="button" onClick={clearAll} className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
            Tout effacer
          </button>
        )}
      </div>

      {/* Tableau des variantes */}
      {rows.length === 0 ? (
        <p className="text-xs text-text-secondary">
          Aucune variante. Ajoutez couleurs/tailles ci-dessus puis « Générer », ou ajoutez une ligne manuellement.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-medium text-text-secondary">{rows.length} variante{rows.length > 1 ? "s" : ""}</span>
            <span className="text-[11px] text-text-secondary">Stock total : <b className="text-[#0F172A]">{totalStock}</b></span>
          </div>
          <div className="hidden sm:grid grid-cols-[1fr_1fr_72px_92px_32px] gap-2 px-1 text-[11px] font-medium text-text-secondary">
            <span>Couleur</span><span>Taille</span><span>Stock</span><span>Prix +/−</span><span />
          </div>
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_72px_92px_32px] gap-2 items-center">
              <input value={row.color} onChange={(e) => update(row.key, "color", e.target.value)} placeholder="Noir" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
              <input value={row.size} onChange={(e) => update(row.key, "size", e.target.value)} placeholder="42" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
              <input type="number" min={0} value={row.stock_quantity} onChange={(e) => update(row.key, "stock_quantity", e.target.value)} placeholder="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
              <input type="number" value={row.price_adjustment} onChange={(e) => update(row.key, "price_adjustment", e.target.value)} placeholder="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
              <button type="button" onClick={() => remove(row.key)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors justify-self-center" title="Supprimer la variante">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={addManual} className="flex items-center gap-1.5 text-sm font-medium text-green hover:text-[#15803d] transition-colors">
        <Plus size={15} /> Ajouter une variante manuellement
      </button>
    </div>
  );
}
