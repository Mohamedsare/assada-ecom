"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Wand2, X, Check } from "lucide-react";
import type { ProductVariant } from "@/types";
import { COLOR_PALETTE, colorToHex, normalizeColor, isLightColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface VariantRow {
  key: string;
  color: string;
  size: string;
  stock_quantity: string;
  price_adjustment: string;
}

let keySeq = 0;
const newKey = () => `v${++keySeq}-${Date.now()}`;

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
 *  - Couleurs choisies dans une palette (vraies pastilles, plus de texte libre).
 *  - Tailles (chips + presets) → génération de la matrice.
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

  const [colors, setColors] = useState<string[]>(
    [...new Set(initial.map((r) => r.color).filter(Boolean))]
  );
  const [sizes, setSizes] = useState<string[]>(
    [...new Set(initial.map((r) => r.size).filter(Boolean))]
  );
  const [sizeInput, setSizeInput] = useState("");

  // ── Couleurs (palette) ────────────────────────────────────────────────────────
  const toggleColor = (colorName: string) => {
    setColors((prev) =>
      prev.some((x) => normalizeColor(x) === normalizeColor(colorName))
        ? prev.filter((x) => normalizeColor(x) !== normalizeColor(colorName))
        : [...prev, colorName]
    );
  };

  // ── Tailles (chips + presets) ─────────────────────────────────────────────────
  const addSizes = (raw: string) => {
    const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
    if (!values.length) return;
    setSizes((prev) => {
      const next = [...prev];
      for (const v of values) if (!next.some((x) => normalizeColor(x) === normalizeColor(v))) next.push(v);
      return next;
    });
  };
  const removeSize = (val: string) => setSizes((prev) => prev.filter((x) => x !== val));
  const sizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSizes(sizeInput);
      setSizeInput("");
    }
  };

  // ── Génération de la matrice (préserve stock/prix existants) ──────────────────
  const combos = useMemo(() => {
    const c = colors.length ? colors : [""];
    const s = sizes.length ? sizes : [""];
    const list: { color: string; size: string }[] = [];
    for (const col of c) for (const sz of s) list.push({ color: col, size: sz });
    return list.filter((x) => x.color || x.size);
  }, [colors, sizes]);

  const buildRows = (prev: VariantRow[]): VariantRow[] => {
    const prevByKey = new Map(prev.map((r) => [`${normalizeColor(r.color)}|${normalizeColor(r.size)}`, r]));
    return combos.map(({ color, size }) => {
      const existing = prevByKey.get(`${normalizeColor(color)}|${normalizeColor(size)}`);
      return existing
        ? { ...existing, color, size }
        : { key: newKey(), color, size, stock_quantity: "0", price_adjustment: "0" };
    });
  };

  const generate = () => {
    if (!combos.length) return;
    setRows((prev) => buildRows(prev));
  };

  // Synchronise automatiquement la matrice quand couleurs/tailles changent
  // (on ignore le montage initial pour ne pas altérer les variantes chargées).
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (!combos.length) return;
    setRows((prev) => buildRows(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes]);

  // ── Lignes ────────────────────────────────────────────────────────────────
  const update = (key: string, field: keyof VariantRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const remove = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));
  const addManual = () =>
    setRows((prev) => [...prev, { key: newKey(), color: "", size: "", stock_quantity: "0", price_adjustment: "0" }]);
  const clearAll = () => setRows([]);

  const totalStock = rows.reduce((s, r) => s + (Number(r.stock_quantity) || 0), 0);

  // Options du menu couleur des lignes = couleurs sélectionnées + éventuelles couleurs héritées.
  const colorOptions = useMemo(
    () => [...new Set([...colors, ...rows.map((r) => r.color).filter(Boolean)])],
    [colors, rows]
  );

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

      {/* Couleurs — palette */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-2">Couleurs (cliquez pour sélectionner)</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((c) => {
            const selected = colors.some((x) => normalizeColor(x) === normalizeColor(c.name));
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c.name)}
                title={c.name}
                aria-pressed={selected}
                className={cn(
                  "relative w-8 h-8 rounded-full transition-transform hover:scale-110",
                  selected ? "ring-2 ring-offset-2 ring-green" : "ring-1 ring-gray-300"
                )}
                style={{ background: c.hex }}
              >
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check size={14} className={isLightColor(c.hex) ? "text-black" : "text-white"} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {colors.length > 0 && (
          <p className="mt-2 text-[11px] text-text-secondary">
            Sélectionnées : <b className="text-[#0F172A]">{colors.join(", ")}</b>
          </p>
        )}
      </div>

      {/* Tailles */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">Tailles</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addSizes(p.sizes.join(","))}
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
              <button type="button" onClick={() => removeSize(s)} className="text-gray-400 hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value)}
          onKeyDown={sizeKeyDown}
          onBlur={() => { if (sizeInput.trim()) { addSizes(sizeInput); setSizeInput(""); } }}
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
          Aucune variante. Choisissez couleurs/tailles ci-dessus puis « Générer », ou ajoutez une ligne manuellement.
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
          {rows.map((row) => {
            const hex = colorToHex(row.color);
            return (
              <div key={row.key} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_72px_92px_32px] gap-2 items-center">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-green transition-colors">
                  <span
                    className="w-4 h-4 rounded-full shrink-0 ring-1 ring-gray-300"
                    style={{ background: hex ?? "conic-gradient(#f87171,#facc15,#4ade80,#60a5fa,#c084fc,#f87171)" }}
                  />
                  <select
                    value={row.color}
                    onChange={(e) => update(row.key, "color", e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                  >
                    <option value="">—</option>
                    {colorOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <input value={row.size} onChange={(e) => update(row.key, "size", e.target.value)} placeholder="42" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
                <input type="number" min={0} value={row.stock_quantity} onChange={(e) => update(row.key, "stock_quantity", e.target.value)} placeholder="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
                <input type="number" value={row.price_adjustment} onChange={(e) => update(row.key, "price_adjustment", e.target.value)} placeholder="0" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green transition-colors" />
                <button type="button" onClick={() => remove(row.key)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors justify-self-center" title="Supprimer la variante">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button type="button" onClick={addManual} className="flex items-center gap-1.5 text-sm font-medium text-green hover:text-[#15803d] transition-colors">
        <Plus size={15} /> Ajouter une variante manuellement
      </button>
    </div>
  );
}
