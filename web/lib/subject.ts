export function subjectLine(kind: string, subject: string, date: string): string {
  const d = date ? ` vom ${date}` : "";
  switch (kind) {
    case "widerspruch":
      return `Widerspruch gegen den Bescheid${d}${subject ? ` – ${subject}` : ""}`;
    case "einspruch":
      return `Einspruch gegen den Bußgeldbescheid${d}${subject ? ` – ${subject}` : ""}`;
    case "steuer":
      return `Einspruch gegen den Steuerbescheid${d}${subject ? ` – ${subject}` : ""}`;
    case "unterlagen":
      return `Ihr Schreiben${d} – Nachreichung von Unterlagen${subject ? `: ${subject}` : ""}`;
    case "nachfrage":
      return `Ihr Schreiben${d} – Rückfrage und Stellungnahme${subject ? `: ${subject}` : ""}`;
    case "fristverlaengerung":
      return `Ihr Schreiben${d} – Bitte um Fristverlängerung${subject ? `: ${subject}` : ""}`;
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
