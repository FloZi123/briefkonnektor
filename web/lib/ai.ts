import Anthropic from "@anthropic-ai/sdk";
import { ExtractedSchema, LETTER_KINDS, type Draft, type Extracted } from "./types";
import { subjectLine } from "./subject";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
const client = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const KINDS = Object.entries(LETTER_KINDS)
  .map(([k, v]) => `${k} = ${v.label}`)
  .join("; ");

/** Foto oder PDF eines Bescheids/Schreibens → strukturierte Felder. Das Bild verlässt die Funktion nicht; nichts wird gespeichert. */
export async function extractFromDocument(bytes: Buffer, mime: string): Promise<Extracted> {
  const isPdf = mime === "application/pdf";
  const source = isPdf
    ? { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: bytes.toString("base64") } }
    : { type: "image" as const, source: { type: "base64" as const, media_type: mime as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: bytes.toString("base64") } };

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1200,
    system:
      "Du extrahierst Felder aus einem fotografierten deutschen Behörden- oder Geschäftsschreiben. Antworte ausschließlich mit einem JSON-Objekt, ohne Erklärung. " +
      "Felder: kind (eine der Briefarten: " + KINDS + " – die Briefart, die der Empfänger des Dokuments jetzt vermutlich schreiben will; bei Bescheiden mit Rechtsbehelfsbelehrung 'widerspruch'), " +
      "recipient (die Stelle, die das Dokument geschickt hat – also der künftige Empfänger des Antwortbriefs: name, name2, street, zip, city, country ISO-2), " +
      "sender (der Adressat des Dokuments, falls im Anschriftfeld lesbar: name, street, zip, city), " +
      "reference (Aktenzeichen, Kunden-, Vertrags- oder Geschäftszeichen), documentDate (TT.MM.JJJJ), subject (worum es geht, ein Satz, deutsch), " +
      "deadlineHint (Frist laut Rechtsbehelfsbelehrung oder Text, wörtlich), amount (Betrag falls genannt), confidence (high|medium|low). " +
      "Unlesbare oder fehlende Felder weglassen, nie raten. Bei Adressen Straße und Hausnummer in street, PLZ fünfstellig in zip.",
    messages: [{ role: "user", content: [source, { type: "text", text: "Extrahiere die Felder als JSON." }] }],
  });
  const text = res.content.find((c) => c.type === "text")?.text ?? "{}";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = ExtractedSchema.safeParse(JSON.parse(json));
  if (!parsed.success) throw new Error("Erkennung lieferte kein gültiges Ergebnis");
  return parsed.data;
}

/** Brieftext aus Briefart + Angaben; optional mit Anpassungsanweisung auf einen bestehenden Text. */
export async function draftLetter(d: Draft, instruction?: string): Promise<string> {
  const kind = LETTER_KINDS[d.kind];
  const facts = [
    `Briefart: ${kind.label}`,
    `Empfänger: ${d.recipient.name}${d.recipient.name2 ? ", " + d.recipient.name2 : ""}`,
    d.reference && `Aktenzeichen/Nummer: ${d.reference}`,
    d.documentDate && `Datum des Schreibens, auf das geantwortet wird: ${d.documentDate}`,
    `Betreff: ${subjectLine(d.kind, d.subject, d.documentDate)}`,
    d.subject && `Worum es geht: ${d.subject}`,
    d.reason && `Angaben des Absenders (Stichpunkte): ${d.reason}`,
    d.deadline && `Berechnete Frist (nur zur Info, nicht in den Brief schreiben): ${d.deadline}`,
    `Absender: ${d.sender.name}`,
  ]
    .filter(Boolean)
    .join("\n");

  const system =
    "Du formulierst für Privatpersonen in Deutschland Briefe an Behörden, Vermieter und Unternehmen. " +
    "Regeln: Deutsch, Sie-Form, sachlich, höflich-bestimmt, klar gegliederte Absätze, keine Floskeln, keine Emotionen. " +
    "Nur Anrede bis Grußformel ausgeben – KEINE Adressen, KEIN Betreff, KEIN Datum, KEIN Name unter der Grußformel (das setzt das Briefpapier). " +
    "Grußformel: 'Mit freundlichen Grüßen'. Keine Rechtsberatung, keine Paragraphen zitieren außer bei Widerspruch den Satz 'lege ich fristgerecht Widerspruch ein'. " +
    "Bei Widerspruch: Widerspruch einlegen, Begründung aus den Angaben, um Überprüfung, Akteneinsicht und schriftliche Begründung bitten, bis zur Entscheidung um Aussetzung der Vollziehung/Aufrechnung bitten. " +
    "Bei Mängelanzeige: Mangel konkret, Frist zur Beseitigung von 14 Tagen ab Zugang setzen, Mietminderung vorbehalten. " +
    "Bei Mahnung: Forderung, Grund, Zahlungsfrist 14 Tage, Ankündigung weiterer Schritte ohne Drohung. " +
    "Fehlende Fakten nie erfinden – stattdessen Platzhalter in eckigen Klammern wie [Datum] oder [Betrag]. Länge: 120–260 Wörter.";

  const messages: Anthropic.MessageParam[] = instruction && d.body
    ? [
        { role: "user", content: `Angaben:\n${facts}\n\nBisheriger Brief:\n${d.body}` },
        { role: "assistant", content: d.body },
        { role: "user", content: `Überarbeite den Brief: ${instruction} Gib nur den vollständigen neuen Brieftext aus.` },
      ]
    : [{ role: "user", content: `Angaben:\n${facts}\n\nSchreibe den Brief.` }];

  const res = await client().messages.create({ model: MODEL, max_tokens: 1500, system, messages });
  const text = res.content.find((c) => c.type === "text")?.text?.trim();
  if (!text) throw new Error("Kein Text erhalten");
  return text;
}
