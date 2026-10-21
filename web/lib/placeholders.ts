/** Platzhalter wie [Datum] oder [BITTE ERGÄNZEN] im Brieftext – müssen vor Unterschrift ersetzt sein. */
export const PLACEHOLDER_RE = /\[[^\[\]\n]{1,80}\]/g;

export function findPlaceholders(body: string): string[] {
  return Array.from(new Set((body.match(PLACEHOLDER_RE) ?? []).map((s) => s.trim())));
}
