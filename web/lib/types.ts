import { z } from "zod";

export const LETTER_KINDS = {
  widerspruch: { label: "Widerspruch gegen Bescheid", hint: "1 Monat Frist", deadlineDays: 30 },
  einspruch: { label: "Einspruch gegen Bußgeldbescheid", hint: "2 Wochen Frist", deadlineDays: 14 },
  unterlagen: { label: "Unterlagen nachreichen", hint: "Antwort auf Aufforderung", deadlineDays: null },
  nachfrage: { label: "Nachfrage / Stellungnahme", hint: "etwas klären oder erklären", deadlineDays: null },
  fristverlaengerung: { label: "Fristverlängerung beantragen", hint: "mehr Zeit erbitten", deadlineDays: null },
  maengel: { label: "Mängelanzeige an Vermieter", hint: "mit Frist zur Beseitigung", deadlineDays: null },
  nebenkosten: { label: "Widerspruch Nebenkostenabrechnung", hint: "12 Monate ab Zugang", deadlineDays: 365 },
  mahnung: { label: "Zahlungsaufforderung / Mahnung", hint: "mit Zahlungsfrist", deadlineDays: null },
  beschwerde: { label: "Beschwerde", hint: "", deadlineDays: null },
  frei: { label: "Freier Brief", hint: "", deadlineDays: null },
} as const;
export type LetterKind = keyof typeof LETTER_KINDS;

export const AddressSchema = z.object({
  name: z.string().min(1, "Name fehlt"),
  name2: z.string().optional().default(""),
  street: z.string().min(1, "Straße fehlt"),
  zip: z.string().min(4, "PLZ fehlt"),
  city: z.string().min(1, "Ort fehlt"),
  country: z.string().length(2).default("DE"),
});
export type Address = z.infer<typeof AddressSchema>;

/** Was aus dem Foto bzw. den Fragen kommt – alles optional, wird vom Nutzer bestätigt. */
export const ExtractedSchema = z.object({
  kind: z.enum(Object.keys(LETTER_KINDS) as [LetterKind, ...LetterKind[]]).optional(),
  recipient: AddressSchema.partial().optional(),
  sender: AddressSchema.partial().optional(),
  reference: z.string().optional().describe("Aktenzeichen / Kundennummer / Vertragsnummer"),
  documentDate: z.string().optional().describe("Datum des Bescheids/Schreibens, TT.MM.JJJJ"),
  subject: z.string().optional().describe("Worum es geht, in einem Satz"),
  deadlineHint: z.string().optional().describe("Frist laut Dokument, falls genannt"),
  remedy: z.enum(["widerspruch", "einspruch", "klage", "beschwerde", "keine"]).optional().describe("Rechtsbehelf laut Rechtsbehelfsbelehrung"),
  remedyText: z.string().optional().describe("Rechtsbehelfsbelehrung in einem Satz, wörtlich gekürzt"),
  documentType: z.string().optional().describe("Art des Schreibens, z. B. Bescheid, Aufforderung, Anhörung, Mahnung, Mitteilung"),
  summary: z.string().optional().describe("3–5 Sätze in einfacher Sprache: wer schreibt, was entschieden oder verlangt wird, was passiert, wenn man nichts tut"),
  demand: z.string().optional().describe("Was konkret vom Empfänger verlangt wird, ein Satz; leer, wenn nichts verlangt wird"),
  options: z.array(z.enum(Object.keys(LETTER_KINDS) as [LetterKind, ...LetterKind[]])).optional().describe("Passende Briefarten, beste zuerst, max. 3"),
  keyFacts: z.array(z.string()).optional().describe("Wichtige Fakten aus dem Schreiben: Beträge, Zeiträume, Fristen, Leistungsart, Vertragsnummern – je ein kurzer Satz"),
  amount: z.string().optional().describe("Betrag, falls genannt"),
  confidence: z.enum(["high", "medium", "low"]).optional(),
});
export type Extracted = z.infer<typeof ExtractedSchema>;

export type Shipping = "post" | "registered" | "download";

export interface Draft {
  kind: LetterKind;
  recipient: Address;
  sender: Address;
  reference: string;
  documentDate: string;
  subject: string;
  reason: string;
  body: string;
  remedy?: Extracted["remedy"]; // aus der Rechtsbehelfsbelehrung des Fotos
  remedyText?: string;
  amount?: string; // Betrag laut Schreiben, falls genannt
  understanding?: { documentType?: string; summary?: string; demand?: string; deadlineHint?: string; options?: LetterKind[]; keyFacts?: string[] };
  signature?: string; // data:image/png;base64
  shipping: Shipping;
  email: string;
  deadline?: string; // berechnet, TT.MM.JJJJ
}

export const PRICES: Record<Shipping, { cents: number; label: string; hint: string }> = {
  post: { cents: Number(process.env.NEXT_PUBLIC_PRICE_POST_CENTS ?? 499), label: "Brief per Post", hint: "Druck, Umschlag, Porto. Zustellung in 2–4 Werktagen." },
  registered: { cents: Number(process.env.NEXT_PUBLIC_PRICE_REGISTERED_CENTS ?? 999), label: "Einschreiben Einwurf", hint: "Zustellnachweis – empfohlen bei Fristen." },
  download: { cents: Number(process.env.NEXT_PUBLIC_PRICE_DOWNLOAD_CENTS ?? 99), label: "Nur PDF-Download", hint: "Selbst drucken, unterschreiben, einwerfen. Pflicht bei Miet- und Arbeitsvertrag." },
};

export const euro = (cents: number) => (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
