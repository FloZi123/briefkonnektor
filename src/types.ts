import { z } from "zod";

/** Postanschrift – DIN 5008-konform, maximal 6 Zeilen im Anschriftfeld. */
export const AddressSchema = z.object({
  name: z.string().min(1).describe("Name oder Firma, z. B. 'Max Mustermann' oder 'Muster GmbH'"),
  name2: z.string().optional().describe("Zusatz, z. B. 'z. Hd. Frau Schmidt' oder Abteilung"),
  street: z.string().min(1).describe("Straße und Hausnummer, z. B. 'Hauptstraße 12'"),
  zip: z.string().min(3).describe("Postleitzahl"),
  city: z.string().min(1).describe("Ort"),
  country: z
    .string()
    .length(2)
    .default("DE")
    .describe("Ländercode ISO-3166-1 alpha-2, z. B. DE, AT, CH"),
});
export type Address = z.infer<typeof AddressSchema>;

export const SenderSchema = AddressSchema.extend({
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
});
export type Sender = z.infer<typeof SenderSchema>;

export type LetterStatus =
  | "draft"
  | "queued"
  | "sent"
  | "delivered"
  | "failed"
  | "cancelled";

export interface Letter {
  id: string;
  customer: string;
  createdAt: string;
  sender: Sender;
  recipient: Address;
  subject: string;
  body: string;
  date: string;
  color: boolean;
  duplex: boolean;
  pdf: Uint8Array;
  pages: number;
  status: LetterStatus;
  carrier?: string;
  carrierRef?: string;
  carrierStatus?: string;
  sentAt?: string;
  lastError?: string;
}

export interface SendOptions {
  color: boolean;
  duplex: boolean;
  /** Pingen-Postprodukt: cheap (Standard), fast (Priority), registered (Einschreiben), bulk, premium */
  product?: "cheap" | "fast" | "registered" | "bulk" | "premium";
}

export interface SendResult {
  carrierRef: string;
  carrierStatus: string;
}

export interface StatusResult {
  carrierStatus: string;
  /** Normalisierter Status für unser Dashboard */
  status: LetterStatus;
  deliveredAt?: string;
  trackingNumber?: string; // Einschreiben-Sendungsnummer
  submittedAt?: string;
}

export interface Carrier {
  readonly name: string;
  send(letter: Letter, opts: SendOptions): Promise<SendResult>;
  status(carrierRef: string): Promise<StatusResult>;
  /** Netto-Preis in EUR für einen einzelnen Brief (Schätzung) */
  estimatePrice(pages: number, opts: SendOptions, country: string): number;
}
