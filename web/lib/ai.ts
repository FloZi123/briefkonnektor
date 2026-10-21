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
    max_tokens: 1600,
    system:
      "Du extrahierst Felder aus einem fotografierten deutschen Behörden- oder Geschäftsschreiben. Antworte ausschließlich mit einem JSON-Objekt, ohne Erklärung. " +
      "Felder: kind (eine der Briefarten: " + KINDS + " – die Briefart, die der Empfänger des Dokuments jetzt vermutlich schreiben will; bei Bescheiden mit Rechtsbehelfsbelehrung 'widerspruch'), " +
      "recipient (die Stelle, die das Dokument geschickt hat – also der künftige Empfänger des Antwortbriefs: name, name2, street, zip, city, country ISO-2), " +
      "sender (der Adressat des Dokuments, falls im Anschriftfeld lesbar: name, street, zip, city), " +
      "reference (Aktenzeichen, Kunden-, Vertrags- oder Geschäftszeichen), documentDate (TT.MM.JJJJ), subject (worum es geht, ein Satz, deutsch), " +
      "deadlineHint (Frist laut Rechtsbehelfsbelehrung oder Text, wörtlich), " +
      "remedy (Rechtsbehelf laut Rechtsbehelfsbelehrung: widerspruch | einspruch | klage | beschwerde | keine – bei Bußgeldbescheiden ist es 'einspruch', dann auch kind='einspruch'), " +
      "remedyText (Kernsatz der Rechtsbehelfsbelehrung, max. 160 Zeichen), amount (Betrag falls genannt), confidence (high|medium|low), " +
      "documentType (Art des Schreibens in 1–2 Wörtern: Bescheid, Aufforderung, Anhörung, Mahnung, Mitteilung, Rechnung, Vertrag …), " +
      "summary (3–5 kurze Sätze in einfacher Sprache für Laien: wer schreibt, was wurde entschieden oder verlangt, was passiert, wenn man nichts tut – nur was im Dokument steht, keine Bewertung, keine Empfehlung), " +
      "demand (was konkret vom Empfänger verlangt wird, ein Satz; weglassen, wenn nichts verlangt wird), " +
      "options (Array der passenden Briefarten aus der Liste, beste zuerst, max. 3 – z. B. bei einer Aufforderung zur Mitwirkung: unterlagen, fristverlaengerung, nachfrage; bei einem ablehnenden Bescheid: widerspruch, nachfrage). " +
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
    d.reason && `Angaben des Absenders (frei gesprochen oder getippt, ggf. umgangssprachlich und ungeordnet – daraus den Sachverhalt und das Anliegen herausarbeiten): ${d.reason}`,
    d.deadline && `Berechnete Frist (nur zur Info, nicht in den Brief schreiben): ${d.deadline}`,
    `Absender: ${d.sender.name}`,
  ]
    .filter(Boolean)
    .join("\n");

  const system =
    "Du formulierst für Privatpersonen in Deutschland Briefe an Behörden, Vermieter und Unternehmen. " +
    "Regeln: Deutsch, Sie-Form, sachlich, höflich-bestimmt, klar gegliederte Absätze, keine Floskeln, keine Emotionen. " +
    "Nur Anrede bis Grußformel ausgeben – KEINE Adressen, KEIN Betreff, KEIN Datum, KEIN Name unter der Grußformel (das setzt das Briefpapier). " +
    "Grußformel: 'Mit freundlichen Grüßen'. " +
    "Verboten (Rechtsdienstleistungsgesetz): Erfolgsaussichten bewerten, Paragraphen oder Urteile zitieren, Fristen berechnen, rechtliche Behauptungen aufstellen, die nicht aus den Angaben stammen. Erlaubt: die Erklärung selbst ('lege ich fristgerecht Widerspruch ein'), Bitten (Überprüfung, Akteneinsicht, Begründung), Fristen setzen bei Mängelanzeige/Mahnung. " +
    "Bei Einspruch gegen Bußgeldbescheid: 'lege ich Einspruch ein', Begründung nur wenn Angaben vorhanden (sonst ankündigen, dass sie nach Akteneinsicht folgt), um Akteneinsicht bitten. " +
    "Bei Unterlagen nachreichen: Bezug auf die Aufforderung, beigefügte Unterlagen als Aufzählung (nur die aus den Angaben), fehlende Unterlagen mit Grund und Nachreichtermin nennen, um Eingangsbestätigung bitten. " +
    "Bei Nachfrage/Stellungnahme: Fragen nummeriert und konkret, Stellungnahme sachlich zu den Punkten des Schreibens, um schriftliche Antwort bitten; nichts einräumen, was der Absender nicht angegeben hat. " +
    "Bei Fristverlängerung: Bezug, bisherige Frist, Grund aus den Angaben, konkreter neuer Termin (sonst Platzhalter), Bitte um kurze Bestätigung; Zusicherung, bis dahin zu liefern. " +
    "Bei Widerspruch: Widerspruch einlegen, Begründung aus den Angaben, um Überprüfung, Akteneinsicht und schriftliche Begründung bitten, bis zur Entscheidung um Aussetzung der Vollziehung/Aufrechnung bitten. " +
    "Bei Mängelanzeige: Mangel konkret, Frist zur Beseitigung von 14 Tagen ab Zugang setzen, Mietminderung vorbehalten. " +
    "Bei Mahnung: Forderung, Grund, Zahlungsfrist 14 Tage, Ankündigung weiterer Schritte ohne Drohung. " +
    "Die Angaben des Absenders können diktiert, umgangssprachlich oder ungeordnet sein (z. B. 'ich war da gar nicht, mein Chef kann das bestätigen'): Inhalt übernehmen, in sachliche Briefsprache übersetzen, Wichtiges zuerst, nichts weglassen. " +
    "Fehlende Fakten nie erfinden – stattdessen Platzhalter in eckigen Klammern wie [Datum] oder [Betrag]. Länge: 120–260 Wörter.";

  const messages: Anthropic.MessageParam[] = instruction && d.body
    ? [
        { role: "user", content: `Angaben:\n${facts}\n\nBisheriger Brief:\n${d.body}` },
        { role: "assistant", content: d.body },
        { role: "user", content: `Überarbeite den Brief nach diesem Wunsch (kann diktiert/umgangssprachlich sein): ${instruction}\nGib nur den vollständigen neuen Brieftext aus.` },
      ]
    : [{ role: "user", content: `Angaben:\n${facts}\n\nSchreibe den Brief.` }];

  const res = await client().messages.create({ model: MODEL, max_tokens: 1500, system, messages });
  const text = res.content.find((c) => c.type === "text")?.text?.trim();
  if (!text) throw new Error("Kein Text erhalten");
  return text;
}

export interface ReviewPoint {
  kind: "fehlt" | "beleg" | "anlage" | "widerspruch" | "hinweis";
  text: string;
}

/** Kurze Prüfliste zum fertigen Entwurf – was der Absender vor der Unterschrift noch ergänzen oder prüfen sollte. */
export async function reviewLetter(d: Draft): Promise<ReviewPoint[]> {
  const kind = LETTER_KINDS[d.kind];
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 600,
    system:
      "Du prüfst den Entwurf eines Briefs einer Privatperson (Deutschland) vor dem Versand. Antworte ausschließlich mit einem JSON-Array aus maximal 5 Objekten " +
      '{"kind": "fehlt"|"beleg"|"anlage"|"widerspruch"|"hinweis", "text": "…"}. ' +
      "fehlt = eine für die Briefart wichtige Angabe fehlt oder ist nur Platzhalter; beleg = eine Behauptung, die mit Nachweis stärker wäre; " +
      "anlage = Dokument, das beigelegt werden sollte; widerspruch = Angaben passen nicht zusammen; hinweis = sonst Wichtiges (kein Rechtsrat). " +
      "Kontext: Absender- und Empfängeranschrift, Datum, Betreff, Aktenzeichen und die eigenhändige Unterschrift setzt das Briefpapier automatisch – diese NIE bemängeln. " +
      "Platzhalter in eckigen Klammern werden dem Nutzer bereits separat angezeigt – NICHT nennen; nur echte inhaltliche Lücken, die kein Platzhalter markiert. " +
      "Das Briefdatum ist heute; Fristen nicht kommentieren. Keine rechtliche Bewertung (keine Erfolgsaussichten, keine Paragraphen, keine Urteile, keine Fristberechnung) – nur Vollständigkeit, Belege, Anlagen, Widersprüche in den Angaben. " +
      "Jeder Text ein kurzer, konkreter Satz in Sie-Form, max. 110 Zeichen. Nichts erfinden, keine Paragraphen, keine Allgemeinplätze. " +
      "Lieber 0–2 treffende Punkte als 5 schwache. Wenn nichts zu beanstanden ist, antworte mit [].",
    messages: [
      {
        role: "user",
        content: `Briefart: ${kind.label}\nEmpfänger: ${d.recipient.name}\nAktenzeichen: ${d.reference || "–"}\nDatum des Schreibens: ${d.documentDate || "–"}\nAngaben des Absenders: ${d.reason || "–"}\n\nBrief:\n${d.body}`,
      },
    ],
  });
  const text = res.content.find((c) => c.type === "text")?.text ?? "[]";
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[0]) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p): p is ReviewPoint => !!p && typeof p === "object" && typeof (p as ReviewPoint).text === "string")
      .map((p) => ({ kind: ["fehlt", "beleg", "anlage", "widerspruch", "hinweis"].includes(p.kind) ? p.kind : "hinweis", text: p.text.slice(0, 160) }))
      .slice(0, 5);
  } catch {
    return [];
  }
}
