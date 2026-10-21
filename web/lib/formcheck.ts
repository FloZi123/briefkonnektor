import type { Draft } from "./types";

/**
 * Formale Prüfung je Briefart – deterministisch, keine KI, keine Rechtsbewertung.
 * Prüft nur, ob der Brief die Bestandteile enthält, die für die gewählte Briefart üblich und nötig sind
 * (allgemeine Rechtsinformation, keine Einzelfallprüfung im Sinne des RDG).
 */
export interface FormPoint {
  kind: "form" | "rechtsbehelf" | "schriftform";
  text: string;
  severity: "warn" | "info";
}

const has = (t: string, re: RegExp) => re.test(t);
const FRIST_RE = /\b(frist|bis (zum|spätestens)|innerhalb von|binnen|bis \d{1,2}\.\d{1,2}\.)/i;
const DATE_RE = /\b\d{1,2}\.\s?\d{1,2}\.\s?(\d{2}|\d{4})\b/;
const AMOUNT_RE = /\d+([.,]\d{2})?\s?(€|eur|euro)/i;

export function formCheck(d: Draft): FormPoint[] {
  const b = d.body ?? "";
  const out: FormPoint[] = [];

  // Rechtsbehelf aus dem Foto vs. gewählte Briefart
  if (d.remedy && d.remedy !== "keine") {
    const wants = d.kind;
    const mismatch =
      (d.remedy === "einspruch" && wants === "widerspruch") ||
      (d.remedy === "widerspruch" && wants === "einspruch") ||
      (d.remedy === "klage" && (wants === "widerspruch" || wants === "einspruch"));
    if (mismatch) {
      const label = { einspruch: "Einspruch", widerspruch: "Widerspruch", klage: "Klage", beschwerde: "Beschwerde" }[d.remedy];
      out.push({
        kind: "rechtsbehelf",
        text:
          d.remedy === "klage"
            ? `Laut Rechtsbehelfsbelehrung ist gegen diesen Bescheid Klage vorgesehen, kein ${wants === "einspruch" ? "Einspruch" : "Widerspruch"}. Ein Brief hilft hier meist nicht – bitte die Belehrung lesen oder beraten lassen.`
            : `Laut Rechtsbehelfsbelehrung heißt der Rechtsbehelf „${label}“. Briefart im Schritt zuvor entsprechend wählen.`,
        severity: "warn",
      });
    }
  }

  switch (d.kind) {
    case "widerspruch":
      if (!has(b, /widerspruch/i)) out.push({ kind: "form", text: "Das Wort „Widerspruch“ fehlt im Text – die Erklärung muss eindeutig sein.", severity: "warn" });
      if (!d.documentDate && !d.reference) out.push({ kind: "form", text: "Bescheid nicht eindeutig bezeichnet: Datum oder Aktenzeichen im Schritt zuvor eintragen.", severity: "warn" });
      break;
    case "einspruch":
      if (!has(b, /einspruch/i)) out.push({ kind: "form", text: "Das Wort „Einspruch“ fehlt im Text – die Erklärung muss eindeutig sein.", severity: "warn" });
      if (!d.reference) out.push({ kind: "form", text: "Aktenzeichen des Bußgeldbescheids fehlt – ohne Aktenzeichen kann die Behörde den Einspruch nicht zuordnen.", severity: "warn" });
      out.push({ kind: "form", text: "Einspruch muss innerhalb von 2 Wochen nach Zustellung bei der Bußgeldstelle eingehen – Einschreiben empfohlen.", severity: "info" });
      break;
    case "maengel":
      if (!has(b, FRIST_RE)) out.push({ kind: "form", text: "Keine Frist zur Beseitigung gesetzt – üblich sind 14 Tage ab Zugang.", severity: "warn" });
      if (!has(b, /mangel|mängel|schaden|defekt|schimmel|undicht|heizung|wasser/i)) out.push({ kind: "form", text: "Der Mangel sollte konkret benannt sein (was, wo, seit wann).", severity: "warn" });
      break;
    case "nebenkosten":
      if (!has(b, /\b20\d{2}\b/)) out.push({ kind: "form", text: "Abrechnungsjahr bzw. -zeitraum im Text nennen.", severity: "warn" });
      if (!has(b, /beleg|einsicht|unterlagen/i)) out.push({ kind: "form", text: "Bitte um Belegeinsicht fehlt – ohne Belege lässt sich die Abrechnung nicht prüfen.", severity: "info" });
      break;
    case "mahnung":
      if (!has(b, AMOUNT_RE)) out.push({ kind: "form", text: "Geforderter Betrag in Euro fehlt im Text.", severity: "warn" });
      if (!has(b, FRIST_RE)) out.push({ kind: "form", text: "Zahlungsfrist fehlt – ein konkretes Datum oder „innerhalb von 14 Tagen“ angeben.", severity: "warn" });
      if (!has(b, /iban|konto|überweis/i)) out.push({ kind: "form", text: "Bankverbindung (IBAN) angeben, damit gezahlt werden kann.", severity: "info" });
      if (!has(b, DATE_RE)) out.push({ kind: "form", text: "Datum der ursprünglichen Rechnung bzw. Fälligkeit nennen.", severity: "info" });
      break;
    case "unterlagen":
      if (!has(b, /anlage|anbei|beigefügt|beiliegend|im anhang/i)) out.push({ kind: "form", text: "Beigefügte Unterlagen im Brief benennen („Anlagen: …“) – sonst kann die Stelle den Eingang nicht zuordnen.", severity: "warn" });
      if (!d.reference) out.push({ kind: "form", text: "Aktenzeichen bzw. Kunden-/Vorgangsnummer eintragen, damit die Unterlagen zur Akte kommen.", severity: "warn" });
      break;
    case "nachfrage":
      if (!has(b, /\?/) && !has(b, /bitte (teilen|erläutern|erklären|nennen)/i)) out.push({ kind: "form", text: "Die Frage bzw. Bitte um Auskunft sollte klar erkennbar sein.", severity: "info" });
      break;
    case "fristverlaengerung":
      if (!has(b, DATE_RE)) out.push({ kind: "form", text: "Neuen Termin nennen, bis zu dem Sie liefern – ein konkretes Datum.", severity: "warn" });
      if (!d.reference) out.push({ kind: "form", text: "Aktenzeichen eintragen, damit die Verlängerung zum Vorgang kommt.", severity: "warn" });
      break;
    case "beschwerde":
      if (!has(b, DATE_RE)) out.push({ kind: "form", text: "Datum des Vorfalls nennen, auf den sich die Beschwerde bezieht.", severity: "info" });
      break;
  }

  if (needsWrittenForm(d)) {
    out.push({
      kind: "schriftform",
      text: "Kündigung eines Miet-, Pacht- oder Arbeitsvertrags verlangt die eigenhändige Unterschrift – gedruckt gilt sie nicht. Im Versandschritt „Download“ wählen, ausdrucken, von Hand unterschreiben.",
      severity: "warn",
    });
  }
  return out;
}

/** Schriftform nach § 126 BGB nötig (eigenhändige Unterschrift): Kündigung von Miet-/Pacht-/Arbeitsverhältnis. */
export function needsWrittenForm(d: Draft): boolean {
  const t = `${d.subject} ${d.body}`;
  return /kündig/i.test(t) && /(miet|pacht|arbeitsverh|arbeitsvertrag|anstellung)/i.test(t);
}
