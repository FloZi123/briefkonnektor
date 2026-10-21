import { renderLetter } from "../src/letter/render";

/** Layout-Test: extreme Eingaben dürfen keine Zeile über den Rand schieben; die Prüfung muss echte Verstöße melden. */
const base = {
  sender: { name: "Florian Zinkl", street: "Voggendorf 4", zip: "92545", city: "Niedermurach", country: "DE" },
  recipient: { name: "Josef Bauer GmbH", name2: "Bauunternehmen", street: "Rottendorfer Straße 38", zip: "92545", city: "Niedermurach", country: "DE" },
  date: "21.10.2026",
};

// 1. sehr langer Betreff + langer Text + lange Infozeile → wird umbrochen, keine Warnung außer Betreff-Kürzung
const r1 = await renderLetter({
  ...base,
  subject: "Beschwerde: Rechnung über gelieferte Baustoffe (Kies, Zement, Putzsand) in Höhe von 125,66 EUR brutto, Rechnungs-Nr. 2026-150, Kundennummer 10550, Lieferung vom 03.07.2026 nach Niedermurach",
  body: "Sehr geehrte Damen und Herren,\n\n" + "Dies ist ein sehr langer Absatz ohne jede Pause, der den Umbruch an der rechten Seite erzwingt und zeigt, dass kein Wort über den Rand hinausläuft. ".repeat(40) + "\n\nMit freundlichen Grüßen",
  infoLines: ["Ihr Zeichen: Rechnungs-Nr. 2026-150, Kd-Nr. 10550"],
  signatoryName: "Florian Zinkl",
});
const overflow = r1.warnings.filter((w) => w.includes("über den Rand"));
if (overflow.length) throw new Error("Randüberschreitung: " + overflow.join(" | "));
if (!r1.warnings.some((w) => w.startsWith("Betreff gekürzt"))) throw new Error("Betreff-Kürzung nicht gemeldet");
console.log(`✓ Langer Betreff/Text: ${r1.pages} Seiten, keine Randüberschreitung; gemeldet: ${r1.warnings.join("; ")}`);

// 2. ein Wort, das breiter als die Zeile ist → wird zeichenweise gebrochen, keine Randüberschreitung
const r2 = await renderLetter({ ...base, subject: "Test", body: "Sehr geehrte Damen und Herren,\n\n" + "X".repeat(140) + "\n\nMit freundlichen Grüßen" });
if (r2.warnings.some((w) => w.includes("über den Rand"))) throw new Error("überlanges Wort nicht gebrochen: " + r2.warnings.join(" | "));
console.log("✓ Überlanges Wort wird gebrochen");

// 3. Anschrift mit zu langer Zusatzzeile → gekürzt, bleibt in der Fensterzone
const r3 = await renderLetter({ ...base, recipient: { ...base.recipient, name2: "Abteilung Rechnungswesen, Team Nord, Gebäude 3, Zimmer 12", country: "AT" }, subject: "Test", body: "Text" });
if (r3.warnings.some((w) => w.includes("über den Rand") || w.includes("Fensterzone"))) throw new Error("Anschrift nicht eingepasst: " + r3.warnings.join(" | "));
console.log("✓ Anschrift eingepasst:", r3.warnings.join("; ") || "keine Kürzung nötig");

// 4. Normalfall → keine Warnungen
const r4 = await renderLetter({ ...base, subject: "Widerspruch gegen den Bescheid vom 01.10.2026", body: "Sehr geehrte Damen und Herren,\n\nhiermit lege ich Widerspruch ein.\n\nMit freundlichen Grüßen" });
if (r4.warnings.length) throw new Error("Normalfall mit Warnungen: " + r4.warnings.join(" | "));
console.log("✓ Normalfall: keine Warnungen\n\nLayout-Test bestanden.");
export {};
