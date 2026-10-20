/**
 * Preislogik: Einkaufspreise (Pingen-Komponentenpreise, Lettershop-Konfigurator) und Verkaufspreise.
 * Alle Beträge netto EUR. Stand: Pingen-Preisliste + Support-Antwort 20.10.2026, Lettershop-Druck.de Konfigurator 19.10.2026.
 */

// ---------- Pingen: Komponentenpreise ----------

export const PINGEN = {
  /** Auftragsgebühr + Kuvert je Brief – Staffel nach Monatsvolumen des gesamten Pingen-Kontos */
  orderFee: { below500: 0.36, from500: 0.18 },
  paperPerSheet: 0.05,
  printPerPage: { grayscale: 0.09, color: 0.18 },
  /** Porto je Brief nach Zielland (ISO-2) */
  postage: {
    DE: 0.54, AT: 0.93, CH: 0.78, FR: 0.75, NL: 0.83, GB: 1.02, BE: 0.83, LU: 1.01, ES: 0.47, IN: 0.18,
  } as Record<string, number>,
  postageOther: 1.06,
  /** Einschreiben-Zuschlag je Brief */
  registered: { DE: 3.5, CH: 7.05, FR: 6.5, BE: 9.96, ES: 3.5 } as Record<string, number>,
  premiumAddressDE: 1.5,
};

export interface PingenCostInput {
  country: string;
  pages: number;
  duplex: boolean;
  color: boolean;
  /** Pingen-Monatsvolumen ≥ 500 → reduzierte Auftragsgebühr */
  highVolume?: boolean;
  registered?: boolean;
}

/** Exakter Pingen-Einkaufspreis aus den Komponenten. */
export function pingenCost(i: PingenCostInput): number {
  const c = i.country.toUpperCase();
  const sheets = i.duplex ? Math.ceil(i.pages / 2) : i.pages;
  const highVolume = i.highVolume ?? (process.env.PINGEN_HIGH_VOLUME === "true");
  let total = highVolume ? PINGEN.orderFee.from500 : PINGEN.orderFee.below500;
  total += sheets * PINGEN.paperPerSheet;
  total += i.pages * (i.color ? PINGEN.printPerPage.color : PINGEN.printPerPage.grayscale);
  total += PINGEN.postage[c] ?? PINGEN.postageOther;
  if (i.registered) total += PINGEN.registered[c] ?? 0;
  return +total.toFixed(2);
}

// ---------- Versandklassen (Verkauf) ----------

export type ShippingClass = "single" | "dialogpost_easy" | "dialogpost";

export interface ClassInfo {
  shippingClass: ShippingClass;
  label: string;
  minQuantity: number;
  /** Einkauf netto je Brief (1 Blatt s/w, DE) */
  cost: number;
  /** Verkauf netto je Brief (1 Blatt s/w, DE) */
  price: number;
  carrier: "pingen" | "lettershop";
  advertisingOnly: boolean;
}

const CLASSES: ClassInfo[] = [
  {
    shippingClass: "single",
    label: "Einzelbrief",
    minQuantity: 1,
    cost: pingenCost({ country: "DE", pages: 1, duplex: false, color: false, highVolume: false }), // 1,04
    price: 1.49,
    carrier: "pingen",
    advertisingOnly: false,
  },
  {
    shippingClass: "dialogpost_easy",
    label: "Kampagne (Dialogpost Easy, 500–4.999 Stück)",
    minQuantity: 500,
    cost: 0.68, // Lettershop-Druck.de: 0,116 € Produktion (1.000 Stück) + 0,56 € Porto Easy
    price: 0.99,
    carrier: "lettershop",
    advertisingOnly: true,
  },
  {
    shippingClass: "dialogpost",
    label: "Kampagne (Dialogpost, ab 5.000 Stück)",
    minQuantity: 5000,
    cost: 0.46, // Lettershop-Druck.de: 0,079 € Produktion + 0,38 € Porto
    price: 0.79,
    carrier: "lettershop",
    advertisingOnly: true,
  },
];

/** Wählt die günstigste Klasse für Menge + Inhaltstyp (Rabattklassen nur DE + werblich). */
export function pickClass(quantity: number, isAdvertising: boolean, country = "DE"): ClassInfo {
  if (country.toUpperCase() !== "DE" || !isAdvertising) return CLASSES[0];
  return [...CLASSES]
    .filter((c) => quantity >= c.minQuantity)
    .sort((a, b) => a.price - b.price)[0];
}

export function allClasses(): ClassInfo[] {
  return CLASSES;
}

/**
 * Verkaufspreis Einzelbrief: Einkauf × (1 + SINGLE_MARKUP), mindestens SINGLE_MARGIN_MIN Aufschlag,
 * auf 0,10 aufgerundet, nie unter SINGLE_MIN_PRICE.
 */
export function singlePrice(i: PingenCostInput): number {
  const cost = pingenCost(i);
  const markup = Number(process.env.SINGLE_MARKUP ?? "0.40");
  const marginMin = Number(process.env.SINGLE_MARGIN_MIN ?? "0.45");
  const min = Number(process.env.SINGLE_MIN_PRICE ?? "1.49");
  const target = Math.max(cost * (1 + markup), cost + marginMin);
  return Math.max(min, Math.ceil(target * 10 - 1e-9) / 10);
}
