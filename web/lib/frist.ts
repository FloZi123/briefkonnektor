/**
 * Fristrechner – reine Wiedergabe der gesetzlichen Regeln, keine Bewertung des Einzelfalls.
 *
 * Bekanntgabefiktion: Ein mit der Post übermittelter Bescheid gilt am vierten Tag nach Aufgabe als bekannt gegeben
 * (§ 41 Abs. 2 VwVfG, § 37 Abs. 2 SGB X, § 122 Abs. 2 AO – jeweils seit 1.1.2025; davor drei Tage). Fällt dieser Tag
 * auf Samstag, Sonntag oder gesetzlichen Feiertag, gilt der nächste Werktag (§ 31 Abs. 3 VwVfG, § 26 Abs. 3 SGB X, § 108 Abs. 3 AO).
 * Monatsfristen enden mit Ablauf des Tages, der dem Bekanntgabetag entspricht (§ 188 Abs. 2 BGB); fehlt der Tag, mit dem Monatsende.
 * Fristende an Samstag, Sonntag oder Feiertag → nächster Werktag (§ 193 BGB, § 222 ZPO, § 43 StPO, § 108 AO).
 * Feiertage: nur bundeseinheitliche. Regionale Feiertage (z. B. Fronleichnam, Allerheiligen, Reformationstag) können das
 * Ende um einen Tag verschieben – darauf weist der Rechner hin.
 */

export type FristArt = "widerspruch" | "steuer" | "bussgeld" | "mahnbescheid" | "nebenkosten" | "klage";
export type Zugang = "post" | "zustellung" | "erhalten";

export interface FristInput {
  art: FristArt;
  /** Datum auf dem Schreiben (Bescheiddatum) bzw. bei Zustellung/Erhalt das jeweilige Datum */
  datum: Date;
  zugang: Zugang;
}

export interface FristResult {
  /** Tag, ab dem die Frist läuft (Bekanntgabe/Zustellung/Zugang) */
  start: Date;
  /** letzter Tag, an dem der Brief bei der Stelle eingehen muss */
  ende: Date;
  /** Bekanntgabefiktion (+4 Tage) wurde angewendet */
  fiktion: boolean;
  /** Fristende wurde wegen Wochenende/Feiertag verschoben */
  verschoben: boolean;
  /** Kurzbezeichnung der Frist, z. B. „1 Monat“ */
  dauer: string;
  /** Rechtsgrundlagen */
  normen: string;
  /** Erläuterungen in einfacher Sprache */
  hinweise: string[];
}

export const FRIST_ARTEN: Record<FristArt, { label: string; dauer: string; normen: string; guide?: string; kind?: string }> = {
  widerspruch: { label: "Widerspruch gegen Bescheid (Jobcenter, Kasse, Rente, Amt)", dauer: "1 Monat", normen: "§ 70 VwGO, § 84 SGG; Bekanntgabe § 41 Abs. 2 VwVfG, § 37 Abs. 2 SGB X", guide: "widerspruch-jobcenter-bescheid", kind: "widerspruch" },
  steuer: { label: "Einspruch gegen Steuerbescheid", dauer: "1 Monat", normen: "§ 355 Abs. 1 AO; Bekanntgabe § 122 Abs. 2 AO; Fristende § 108 AO", guide: "einspruch-steuerbescheid", kind: "steuer" },
  bussgeld: { label: "Einspruch gegen Bußgeldbescheid", dauer: "2 Wochen", normen: "§ 67 Abs. 1 OWiG; Fristende § 43 StPO", guide: "einspruch-bussgeldbescheid", kind: "einspruch" },
  mahnbescheid: { label: "Widerspruch gegen Mahnbescheid (Gericht)", dauer: "2 Wochen", normen: "§ 694 Abs. 1 ZPO; Fristende § 222 ZPO", guide: "mahnung-widersprechen", kind: "mahnung" },
  nebenkosten: { label: "Einwendungen gegen Nebenkostenabrechnung", dauer: "12 Monate", normen: "§ 556 Abs. 3 Satz 5 BGB", guide: "widerspruch-nebenkostenabrechnung", kind: "nebenkosten" },
  klage: { label: "Klage nach Widerspruchsbescheid", dauer: "1 Monat", normen: "§ 74 VwGO, § 87 SGG" },
};

/** Osterdatum (Gauß) */
function ostern(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const addDays = (d: Date, n: number): Date => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
};

/** Bundeseinheitliche Feiertage */
export function feiertage(year: number): Date[] {
  const o = ostern(year);
  return [
    new Date(year, 0, 1), // Neujahr
    addDays(o, -2), // Karfreitag
    addDays(o, 1), // Ostermontag
    new Date(year, 4, 1), // Tag der Arbeit
    addDays(o, 39), // Christi Himmelfahrt
    addDays(o, 50), // Pfingstmontag
    new Date(year, 9, 3), // Tag der Deutschen Einheit
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ];
}

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function istWerktag(d: Date): boolean {
  if (d.getDay() === 0 || d.getDay() === 6) return false;
  return !feiertage(d.getFullYear()).some((f) => sameDay(f, d));
}

export function naechsterWerktag(d: Date): Date {
  let x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  while (!istWerktag(x)) x = addDays(x, 1);
  return x;
}

/** + n Monate nach § 188 Abs. 2 BGB: gleicher Monatstag; fehlt er, letzter Tag des Monats (§ 188 Abs. 3 BGB) */
export function plusMonate(d: Date, n: number): Date {
  const tag = d.getDate();
  const ziel = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const letzter = new Date(ziel.getFullYear(), ziel.getMonth() + 1, 0).getDate();
  ziel.setDate(Math.min(tag, letzter));
  return ziel;
}

/** Bekanntgabe bei Postversand: 4. Tag nach Aufgabe (seit 2025; davor 3), Wochenende/Feiertag → nächster Werktag */
export function bekanntgabe(bescheiddatum: Date): { tag: Date; tage: number } {
  const tage = bescheiddatum.getFullYear() >= 2025 ? 4 : 3;
  return { tag: naechsterWerktag(addDays(bescheiddatum, tage)), tage };
}

export function berechneFrist(input: FristInput): FristResult {
  const art = FRIST_ARTEN[input.art];
  const hinweise: string[] = [];
  let start = new Date(input.datum.getFullYear(), input.datum.getMonth(), input.datum.getDate());
  let fiktion = false;

  const nutztFiktion = (input.art === "widerspruch" || input.art === "steuer") && input.zugang === "post";
  if (nutztFiktion) {
    const b = bekanntgabe(start);
    start = b.tag;
    fiktion = true;
    hinweise.push(`Bei Versand mit der Post gilt der Bescheid am ${b.tage}. Tag nach dem Bescheiddatum als bekannt gegeben – auch wenn er früher im Briefkasten lag. Kam er nachweislich später, zählt der tatsächliche Zugang.`);
  } else if ((input.art === "widerspruch" || input.art === "steuer") && input.zugang === "zustellung") {
    hinweise.push("Bei förmlicher Zustellung (gelber Umschlag mit Datum, Postzustellungsurkunde) läuft die Frist ab dem Zustelldatum.");
  } else if (input.art === "bussgeld" || input.art === "mahnbescheid") {
    hinweise.push("Maßgeblich ist das Zustelldatum auf dem gelben Umschlag (Postzustellungsurkunde), nicht das Datum des Schreibens.");
  } else if (input.art === "nebenkosten") {
    hinweise.push("Die Frist läuft ab dem Tag, an dem die Abrechnung bei Ihnen angekommen ist.");
  } else if (input.art === "klage") {
    hinweise.push("Die Frist läuft ab Zustellung des Widerspruchsbescheids.");
  }

  let ende: Date;
  switch (input.art) {
    case "bussgeld":
    case "mahnbescheid":
      ende = addDays(start, 14);
      break;
    case "nebenkosten":
      ende = plusMonate(start, 12);
      break;
    default:
      ende = plusMonate(start, 1);
  }
  const roh = ende;
  ende = naechsterWerktag(ende);
  const verschoben = !sameDay(roh, ende);
  if (verschoben) hinweise.push("Das rechnerische Ende fällt auf ein Wochenende oder einen bundesweiten Feiertag – die Frist endet am nächsten Werktag.");
  hinweise.push("Der Brief muss bis zu diesem Tag bei der Stelle eingehen; das Absenden reicht nicht. Regionale Feiertage (z. B. Fronleichnam, Allerheiligen, Reformationstag) sind nicht berücksichtigt und können das Ende um einen Tag verschieben.");

  return { start, ende, fiktion, verschoben, dauer: art.dauer, normen: art.normen, hinweise };
}
