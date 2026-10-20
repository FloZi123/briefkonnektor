export function subjectLine(kind: string, subject: string, date: string): string {
  const d = date ? ` vom ${date}` : "";
  switch (kind) {
    case "widerspruch":
      return `Widerspruch gegen den Bescheid${d}${subject ? ` – ${subject}` : ""}`;
    case "nebenkosten":
      return `Widerspruch gegen die Nebenkostenabrechnung${d}`;
    case "maengel":
      return `Mängelanzeige${subject ? `: ${subject}` : ""}`;
    case "mahnung":
      return `Zahlungsaufforderung${subject ? `: ${subject}` : ""}`;
    case "beschwerde":
      return `Beschwerde${subject ? `: ${subject}` : ""}`;
    default:
      return subject || "Ihr Schreiben";
  }
}
