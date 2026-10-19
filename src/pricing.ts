/**
 * Preislogik für die Versandklassen.
 * Einkaufspreise sind Schätzwerte (Stand Okt 2026, netto) und werden nach
 * Angebotseingang von Pingen / Lettershop-Partner ersetzt.
 */

export type ShippingClass = "single" | "dialogpost_easy" | "dialogpost";

export interface ClassInfo {
  shippingClass: ShippingClass;
  label: string;
  minQuantity: number;
  /** geschätzter Einkauf netto je Brief (1 Blatt s/w) */
  costEstimate: number;
  /** Verkaufspreis netto je Brief (1 Blatt s/w) */
  price: number;
  carrier: "pingen" | "lettershop";
  advertisingOnly: boolean;
}

const CLASSES: ClassInfo[] = [
  {
    shippingClass: "single",
    label: "Einzelbrief",
    minQuantity: 1,
    costEstimate: 0.86,
    price: 1.39,
    carrier: "pingen",
    advertisingOnly: false,
  },
  {
    shippingClass: "dialogpost_easy",
    label: "Kampagne (Dialogpost Easy, 500–4.999 Stück)",
    minQuantity: 500,
    costEstimate: 0.7,
    price: 0.99,
    carrier: "lettershop",
    advertisingOnly: true,
  },
  {
    shippingClass: "dialogpost",
    label: "Kampagne (Dialogpost, ab 5.000 Stück)",
    minQuantity: 5000,
    costEstimate: 0.5,
    price: 0.79,
    carrier: "lettershop",
    advertisingOnly: true,
  },
];

/** Wählt die günstigste Klasse für Menge + Inhaltstyp (nur DE). */
export function pickClass(quantity: number, isAdvertising: boolean, country = "DE"): ClassInfo {
  if (country !== "DE" || !isAdvertising) return CLASSES[0];
  return [...CLASSES]
    .filter((c) => quantity >= c.minQuantity)
    .sort((a, b) => a.price - b.price)[0];
}

export function allClasses(): ClassInfo[] {
  return CLASSES;
}
