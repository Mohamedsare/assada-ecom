/**
 * Palette de couleurs partagée (admin + fiche produit + modal).
 * Permet de choisir de vraies couleurs plutôt que de taper un nom.
 */
export interface PaletteColor {
  name: string;
  hex: string;
}

export const COLOR_PALETTE: PaletteColor[] = [
  { name: "Noir", hex: "#111827" },
  { name: "Blanc", hex: "#FFFFFF" },
  { name: "Gris", hex: "#9CA3AF" },
  { name: "Gris foncé", hex: "#4B5563" },
  { name: "Rouge", hex: "#EF4444" },
  { name: "Bordeaux", hex: "#7F1D1D" },
  { name: "Rose", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Jaune", hex: "#FACC15" },
  { name: "Or", hex: "#D4AF37" },
  { name: "Vert", hex: "#1E1116" },
  { name: "Vert clair", hex: "#D4AF37" },
  { name: "Kaki", hex: "#556B2F" },
  { name: "Turquoise", hex: "#14B8A6" },
  { name: "Bleu", hex: "#3B82F6" },
  { name: "Bleu clair", hex: "#60A5FA" },
  { name: "Bleu nuit", hex: "#1E1116" },
  { name: "Marine", hex: "#1E3A5F" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Mauve", hex: "#C084FC" },
  { name: "Marron", hex: "#92400E" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Beige", hex: "#E7D3B3" },
  { name: "Crème", hex: "#F5F0E1" },
  { name: "Argent", hex: "#C0C0C0" },
];

export function normalizeColor(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Table de correspondance nom → hex (avec quelques alias courants).
const COLOR_MAP: Record<string, string> = {
  ...Object.fromEntries(COLOR_PALETTE.map((c) => [normalizeColor(c.name), c.hex])),
  dore: "#D4AF37",
  ore: "#D4AF37",
  "gris clair": "#D1D5DB",
};

/** Renvoie le hex d'une couleur nommée, ou null si inconnue. */
export function colorToHex(name?: string | null): string | null {
  if (!name) return null;
  return COLOR_MAP[normalizeColor(name)] ?? null;
}

/** true si la couleur est claire (pour choisir un contour/coche foncés). */
export function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // Luminance perçue
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.8;
}
