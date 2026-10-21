import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Address, Sender } from "../types";

/**
 * Rendert einen Geschäftsbrief nach DIN 5008 Form B (A4, Anschriftfeld im
 * Fensterbereich von DIN-lang-/C6/5-Umschlägen, Falzmarken bei 105 / 210 mm).
 * Standard-Fonts (Helvetica, WinAnsi) – Umlaute, ß und € sind abgedeckt.
 */

const mm = (v: number) => v * 2.834645669; // 1 mm in pt
const A4 = { w: mm(210), h: mm(297) };

const LAYOUT = {
  marginLeft: mm(25),
  marginRight: mm(20),
  addrLeft: mm(20),
  addrTop: mm(45), // Beginn Anschriftfeld (Form B): Zusatz-/Vermerkzone 45–62,7 mm mit Rücksendeangabe
  addrZoneTop: mm(62.7), // Anschriftzone 62,7–90 mm (6 Zeilen) – sichtbar im Fenster von DL/C6-5-Umschlägen
  addrWidth: mm(85),
  infoLeft: mm(125), // Informationsblock
  infoTop: mm(50),
  subjectTop: mm(98.5), // Betreffzeile Form B
  bodyTop: mm(110),
  bodyBottom: mm(25), // unterer Rand
  followTop: mm(25), // Folgeseiten
  fontSize: 11,
  lineHeight: 11 * 1.35,
};

export interface RenderInput {
  sender: Sender;
  recipient: Address;
  subject: string;
  body: string;
  /** Datum als Anzeige-String, z. B. "19.10.2026" */
  date: string;
  /** optionale Zeilen für den Infoblock, z. B. "Kundennr. 4711" */
  infoLines?: string[];
  /** Unterschrift als PNG (Bytes), wird über dem Namen unter der Grußformel eingesetzt */
  signaturePng?: Uint8Array;
  /** Name unter der Unterschrift; Standard: sender.name */
  signatoryName?: string;
}

export interface RenderOutput {
  pdf: Uint8Array;
  pages: number;
  /** Layout-Prüfung nach dem Rendern – leer = alles innerhalb der DIN-5008-Zonen */
  warnings: string[];
}

function countryName(code: string): string | undefined {
  const map: Record<string, string> = {
    AT: "ÖSTERREICH",
    CH: "SCHWEIZ",
    FR: "FRANKREICH",
    NL: "NIEDERLANDE",
    BE: "BELGIEN",
    LU: "LUXEMBURG",
    ES: "SPANIEN",
    IT: "ITALIEN",
    GB: "GROSSBRITANNIEN",
    US: "USA",
  };
  return map[code.toUpperCase()];
}

function addressLines(a: Address, withCountry: boolean): string[] {
  const lines = [a.name, a.name2, a.street, `${a.zip} ${a.city}`].filter(Boolean) as string[];
  if (withCountry && a.country.toUpperCase() !== "DE") {
    lines.push(countryName(a.country) ?? a.country.toUpperCase());
  }
  return lines;
}

function splitLong(word: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const ch of word) {
    if (font.widthOfTextAtSize(cur + ch, size) > maxWidth && cur) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** Kürzt eine Zeile am Wortende auf die Breite, mit „…“. */
function fit(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  const words = text.split(/\s+/);
  let cur = "";
  for (const w of words) {
    const probe = (cur ? cur + " " + w : w) + " …";
    if (font.widthOfTextAtSize(probe, size) > maxWidth) break;
    cur = cur ? cur + " " + w : w;
  }
  if (!cur) cur = splitLong(text, font, size, maxWidth - font.widthOfTextAtSize(" …", size))[0] ?? "";
  return cur + " …";
}

/** Zeilenumbruch nach Wortgrenzen; respektiert vorhandene Absätze. */
function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.replace(/\r\n/g, "\n").split("\n")) {
    if (para.trim() === "") {
      out.push("");
      continue;
    }
    let line = "";
    for (const rawWord of para.split(/\s+/)) {
      // Ein einzelnes Wort, das breiter als die Zeile ist (Aktenzeichen, URL), wird zeichenweise gebrochen
      const pieces = font.widthOfTextAtSize(rawWord, size) <= maxWidth ? [rawWord] : splitLong(rawWord, font, size, maxWidth);
      for (const word of pieces) {
        const probe = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(probe, size) <= maxWidth) {
          line = probe;
        } else {
          if (line) out.push(line);
          line = word;
        }
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/**
 * Layout-Prüfung: jede gezeichnete Zeile wird gegen den rechten Rand gemessen, die Anschrift gegen die Fensterzone,
 * der Betreff gegen die 2-Zeilen-Grenze. Verstöße werden gesammelt, nicht geworfen – der Aufrufer entscheidet.
 */
class LayoutCheck {
  warnings: string[] = [];
  line(label: string, text: string, font: PDFFont, size: number, x: number, maxRight: number) {
    const w = font.widthOfTextAtSize(text, size);
    if (x + w > maxRight + 0.5) this.warnings.push(`${label}: Zeile ragt ${((x + w - maxRight) / 2.834645669).toFixed(1)} mm über den Rand: „${text.slice(0, 40)}…“`);
  }
}

export async function renderLetter(input: RenderInput): Promise<RenderOutput> {
  const check = new LayoutCheck();
  const doc = await PDFDocument.create();
  doc.setTitle(input.subject);
  doc.setAuthor(input.sender.name);
  doc.setProducer("Briefkonnektor");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0, 0, 0);
  const grey = rgb(0.45, 0.45, 0.45);
  const { fontSize: fs, lineHeight: lh } = LAYOUT;
  const textWidth = A4.w - LAYOUT.marginLeft - LAYOUT.marginRight;

  const newPage = (): PDFPage => {
    const p = doc.addPage([A4.w, A4.h]);
    // Falz- und Lochmarken
    const markX = mm(5);
    for (const y of [mm(105), mm(210)]) {
      p.drawLine({ start: { x: markX, y: A4.h - y }, end: { x: markX + mm(4), y: A4.h - y }, thickness: 0.4, color: grey });
    }
    p.drawLine({ start: { x: markX, y: A4.h - mm(148.5) }, end: { x: markX + mm(6), y: A4.h - mm(148.5) }, thickness: 0.4, color: grey });
    return p;
  };

  let page = newPage();
  const s = input.sender;

  // --- Briefkopf (Absender oben rechts) ---
  const headLines = [s.name, s.name2, s.street, `${s.zip} ${s.city}`].filter(Boolean) as string[];
  const contact = [s.phone && `Tel. ${s.phone}`, s.email, s.website].filter(Boolean) as string[];
  let y = A4.h - mm(15);
  page.drawText(s.name, { x: LAYOUT.marginLeft, y, size: 16, font: bold, color: black });
  y = A4.h - mm(15);
  for (const line of [...headLines.slice(1), ...contact]) {
    const w = font.widthOfTextAtSize(line, 9);
    page.drawText(line, { x: A4.w - LAYOUT.marginRight - w, y, size: 9, font, color: grey });
    y -= 9 * 1.3;
  }
  page.drawLine({
    start: { x: LAYOUT.marginLeft, y: A4.h - mm(38) },
    end: { x: A4.w - LAYOUT.marginRight, y: A4.h - mm(38) },
    thickness: 0.5,
    color: grey,
  });

  // --- Anschriftfeld: Rücksendeangabe + Empfänger ---
  const returnLine = `${s.name} · ${s.street} · ${s.zip} ${s.city}`;
  page.drawText(returnLine, { x: LAYOUT.addrLeft, y: A4.h - LAYOUT.addrTop - 6, size: 7, font, color: grey });
  page.drawLine({
    start: { x: LAYOUT.addrLeft, y: A4.h - LAYOUT.addrTop - 9 },
    end: { x: LAYOUT.addrLeft + LAYOUT.addrWidth, y: A4.h - LAYOUT.addrTop - 9 },
    thickness: 0.3,
    color: grey,
  });
  y = A4.h - LAYOUT.addrZoneTop - fs; // erste Zeile der Anschriftzone
  let recipientLines = addressLines(input.recipient, true);
  if (recipientLines.length > 6) {
    recipientLines = addressLines({ ...input.recipient, name2: "" }, true);
    check.warnings.push("Anschrift gekürzt: Zusatz weggelassen (mehr als 6 Zeilen)");
  }
  recipientLines = recipientLines.map((l) => {
    const f = fit(l, font, fs, LAYOUT.addrWidth);
    if (f !== l) check.warnings.push(`Anschrift gekürzt: „${l.slice(0, 40)}…“`);
    return f;
  });
  const addrLh = fs * 1.15; // enger Zeilenabstand in der Anschrift (DIN: 6 Zeilen in 27,3 mm)
  for (const line of recipientLines) {
    check.line("Anschrift", line, font, fs, LAYOUT.addrLeft, LAYOUT.addrLeft + LAYOUT.addrWidth);
    page.drawText(line, { x: LAYOUT.addrLeft, y, size: fs, font, color: black });
    y -= addrLh;
  }
  // Unterkante der letzten Zeile (Grundlinie + Unterlänge) muss innerhalb von 90 mm liegen
  if (A4.h - (y + addrLh - fs * 0.25) > mm(90)) check.warnings.push("Anschrift reicht über die Fensterzone (90 mm) hinaus");

  // --- Informationsblock rechts ---
  y = A4.h - LAYOUT.infoTop;
  const infoWidth = A4.w - mm(10) - LAYOUT.infoLeft; // bis 10 mm vor der Blattkante
  const info = [`Datum: ${input.date}`, ...(input.infoLines ?? [])].flatMap((l) => wrap(l, font, 9.5, infoWidth));
  for (const line of info) {
    check.line("Infoblock", line, font, 9.5, LAYOUT.infoLeft, A4.w - mm(10));
    page.drawText(line, { x: LAYOUT.infoLeft, y, size: 9.5, font, color: black });
    y -= 9.5 * 1.4;
  }

  // --- Betreff (fett, max. 2 Zeilen, Umbruch am rechten Rand) ---
  const subjectAll = wrap(input.subject, bold, fs, textWidth);
  const subjectLines = subjectAll.slice(0, 2);
  if (subjectAll.length > 2) {
    subjectLines[1] = fit(subjectAll.slice(1).join(" "), bold, fs, textWidth);
    check.warnings.push(`Betreff gekürzt auf 2 Zeilen (brauchte ${subjectAll.length})`);
  }
  y = A4.h - LAYOUT.subjectTop;
  for (const line of subjectLines) {
    check.line("Betreff", line, bold, fs, LAYOUT.marginLeft, A4.w - LAYOUT.marginRight);
    page.drawText(line, { x: LAYOUT.marginLeft, y, size: fs, font: bold, color: black });
    y -= lh;
  }

  // --- Text mit Seitenumbruch: 2 Leerzeilen unter dem Betreff ---
  const lines = wrap(input.body, font, fs, textWidth);
  y = Math.min(A4.h - LAYOUT.bodyTop, y - lh);
  let pages = 1;
  const breakPage = () => {
    page = newPage();
    pages++;
    y = A4.h - LAYOUT.followTop;
    page.drawText(`– Seite ${pages} –`, { x: LAYOUT.marginLeft, y: A4.h - mm(15), size: 8, font, color: grey });
  };
  for (const line of lines) {
    if (y < LAYOUT.bodyBottom) breakPage();
    if (line) {
      check.line("Text", line, font, fs, LAYOUT.marginLeft, A4.w - LAYOUT.marginRight);
      page.drawText(line, { x: LAYOUT.marginLeft, y, size: fs, font, color: black });
    }
    y -= lh;
  }

  // --- Unterschrift + Name unter der Grußformel ---
  if (input.signaturePng || input.signatoryName) {
    const sigH = input.signaturePng ? mm(18) : mm(14); // ohne Bild: Platz für die handschriftliche Unterschrift
    const need = sigH + lh * 2;
    if (y - need < LAYOUT.bodyBottom) breakPage();
    if (input.signaturePng) {
      const img = await doc.embedPng(input.signaturePng);
      const scale = Math.min(mm(55) / img.width, sigH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: LAYOUT.marginLeft, y: y - h + lh * 0.3, width: w, height: h });
      y -= h + lh * 0.2;
    }
    const name = input.signatoryName ?? input.sender.name;
    page.drawText(name, { x: LAYOUT.marginLeft, y, size: fs, font, color: black });
    y -= lh;
  }

  if (pages > 4) check.warnings.push(`Brief hat ${pages} Seiten`);
  const pdf = await doc.save();
  return { pdf, pages, warnings: check.warnings };
}
