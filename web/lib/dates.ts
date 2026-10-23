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

/**
 * Widerspruchsfrist: 1 Monat ab Bekanntgabe. Bekanntgabe gilt bei Post am 4. Tag nach Aufgabe (§ 41 VwVfG / § 37 SGB X),
 * Fristende am Monatstag; fällt es auf Sa/So/Feiertag, verschiebt es sich auf den nächsten Werktag (§ 193 BGB).
 * Wir rechnen konservativ: Bekanntgabe = Bescheiddatum + 3 Tage, Ende = +1 Monat, Wochenende → Montag. Feiertage nicht berücksichtigt.
 */
export function widerspruchsfrist(documentDate: string): string | undefined {
  const d = parseDE(documentDate);
  if (!d) return undefined;
  const bekanntgabe = new Date(d);
  bekanntgabe.setDate(bekanntgabe.getDate() + 3);
  const end = new Date(bekanntgabe);
  end.setMonth(end.getMonth() + 1);
  while (end.getDay() === 0 || end.getDay() === 6) end.setDate(end.getDate() + 1);
  return fmtDE(end);
}

export function daysUntil(dateDE: string): number | undefined {
  const d = parseDE(dateDE);
  if (!d) return undefined;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

/**
 * Einspruchsfrist gegen Bußgeldbescheid: 2 Wochen ab Zustellung (§ 67 OWiG). Zustellung meist per Postzustellungsurkunde;
 * wir rechnen konservativ Bescheiddatum + 3 Tage, Ende = +14 Tage, Wochenende → Montag. Feiertage nicht berücksichtigt.
 */
export function einspruchsfrist(documentDate: string): string | undefined {
  const d = parseDE(documentDate);
  if (!d) return undefined;
  const end = new Date(d);
  end.setDate(end.getDate() + 3 + 14);
  while (end.getDay() === 0 || end.getDay() === 6) end.setDate(end.getDate() + 1);
  return fmtDE(end);
}

/**
 * Einspruchsfrist gegen Steuerbescheid: 1 Monat ab Bekanntgabe (§ 355 AO). Bekanntgabe gilt bei Post am 4. Tag nach Aufgabe
 * (§ 122 Abs. 2 AO, seit 2025). Wir rechnen Bescheiddatum + 4 Tage, Ende = +1 Monat, Wochenende → Montag. Feiertage nicht berücksichtigt.
 */
export function steuerfrist(documentDate: string): string | undefined {
  const d = parseDE(documentDate);
  if (!d) return undefined;
  const bekanntgabe = new Date(d);
  bekanntgabe.setDate(bekanntgabe.getDate() + 4);
  const end = new Date(bekanntgabe);
  end.setMonth(end.getMonth() + 1);
  while (end.getDay() === 0 || end.getDay() === 6) end.setDate(end.getDate() + 1);
  return fmtDE(end);
}
