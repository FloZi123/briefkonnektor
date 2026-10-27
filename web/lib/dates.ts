/** Datumshelfer – Anzeige TT.MM.JJJJ, Fristberechnung ohne Rechtsberatung (nur Wiedergabe der Regel). */

export function parseDE(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (!m) return undefined;
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const d = new Date(y, Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? undefined : d;
}

export function fmtDE(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function today(): string {
  return fmtDE(new Date());
}

import { berechneFrist, naechsterWerktag } from "./frist";

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

/**
 * Widerspruchsfrist: 1 Monat ab Bekanntgabe; Bekanntgabe bei Post am 4. Tag nach dem Bescheiddatum (§ 41 VwVfG / § 37 SGB X),
 * Fristende nach § 188 BGB, Wochenende und bundesweite Feiertage → nächster Werktag. Gleiche Logik wie der Fristrechner (lib/frist.ts).
 */
export function widerspruchsfrist(documentDate: string): string | undefined {
  const d = parseDE(documentDate);
  if (!d) return undefined;
  return fmtDE(berechneFrist({ art: "widerspruch", datum: d, zugang: "post" }).ende);
}

export function daysUntil(dateDE: string): number | undefined {
  const d = parseDE(dateDE);
  if (!d) return undefined;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

/**
 * Einspruchsfrist gegen Bußgeldbescheid: 2 Wochen ab Zustellung (§ 67 OWiG). Das Zustelldatum steht auf dem gelben Umschlag und ist
 * aus dem Foto meist nicht bekannt – wir nehmen Bescheiddatum + 3 Tage an (typische Laufzeit der Postzustellungsurkunde) und
 * weisen im Screen darauf hin, dass das Datum auf dem Umschlag maßgeblich ist. Fristende Wochenende/Feiertag → nächster Werktag (§ 43 StPO).
 */
export function einspruchsfrist(documentDate: string): string | undefined {
  const d = parseDE(documentDate);
  if (!d) return undefined;
  return fmtDE(berechneFrist({ art: "bussgeld", datum: addDays(d, 3), zugang: "zustellung" }).ende);
}

/**
 * Einspruchsfrist gegen Steuerbescheid: 1 Monat ab Bekanntgabe (§ 355 AO), Bekanntgabe am 4. Tag nach Aufgabe zur Post (§ 122 Abs. 2 AO),
 * Fristende Wochenende/Feiertag → nächster Werktag (§ 108 Abs. 3 AO). Gleiche Logik wie der Fristrechner.
 */
export function steuerfrist(documentDate: string): string | undefined {
  const d = parseDE(documentDate);
  if (!d) return undefined;
  return fmtDE(berechneFrist({ art: "steuer", datum: d, zugang: "post" }).ende);
}

export { naechsterWerktag };
