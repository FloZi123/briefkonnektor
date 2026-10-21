"use client";
import { useRouter } from "next/navigation";
import { ScreenHead, Fristbox } from "@/components/ui";
import { useDraft } from "@/lib/store";
import { LETTER_KINDS, type LetterKind } from "@/lib/types";
import { widerspruchsfrist, einspruchsfrist, daysUntil } from "@/lib/dates";

/**
 * Nach dem Foto: Was steht im Brief (einfache Sprache), was wird verlangt, welche Frist – dann das Anliegen wählen.
 * Nur Wiedergabe des Dokuments, keine Bewertung (RDG). Die Briefart-Auswahl setzt kind und führt zum Daten-Screen.
 */
const REMEDY_LABEL: Record<string, string> = { widerspruch: "Widerspruch", einspruch: "Einspruch", klage: "Klage", beschwerde: "Beschwerde" };

export default function VerstehenScreen() {
  const { draft, update, ready } = useDraft();
  const router = useRouter();
  if (!ready) return null;
  const u = draft.understanding;
  if (!u?.summary) {
    router.replace("/brief/daten?from=photo");
    return null;
  }

  const suggested = (u.options ?? []).filter((k) => LETTER_KINDS[k]);
  const others = (Object.keys(LETTER_KINDS) as LetterKind[]).filter((k) => !suggested.includes(k) && k !== "frei");
  const fristKind = draft.remedy === "einspruch" ? "einspruch" : draft.remedy === "widerspruch" ? "widerspruch" : suggested[0] === "einspruch" ? "einspruch" : suggested[0] === "widerspruch" ? "widerspruch" : undefined;
  const frist = fristKind === "einspruch" ? einspruchsfrist(draft.documentDate) : fristKind === "widerspruch" ? widerspruchsfrist(draft.documentDate) : undefined;
  const days = frist ? daysUntil(frist) : undefined;

  const choose = (k: LetterKind) => {
    update({ kind: k });
    router.push("/brief/daten?from=photo");
  };

  return (
    <main className="screen">
      <ScreenHead step={1} back="/" />
      <div className="stack" style={{ gap: 6, paddingTop: 8 }}>
        <span className="eyebrow">Das steht in Ihrem Brief</span>
        <h1 style={{ fontSize: 24 }}>
          {u.documentType ?? "Schreiben"}
          {draft.recipient.name ? ` von ${draft.recipient.name}` : ""}
        </h1>
        <p className="muted" style={{ fontSize: 13 }}>
          {draft.documentDate ? `Vom ${draft.documentDate}` : ""}
          {draft.reference ? ` · Az. ${draft.reference}` : ""}
        </p>
      </div>

      <div className="letter" style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55, gap: 0 }}>
        {u.summary.split(/\n+/).map((p, i) => (
          <p key={i} style={{ margin: i ? "8px 0 0" : 0 }}>
            {p}
          </p>
        ))}
        {u.demand && (
          <p style={{ margin: "12px 0 0" }}>
            <strong>Was verlangt wird:</strong> {u.demand}
          </p>
        )}
      </div>

      {(u.deadlineHint || frist) && (
        <div style={{ paddingTop: 12 }}>
          <Fristbox>
            {u.deadlineHint && (
              <>
                <strong>Frist laut Schreiben:</strong> „{u.deadlineHint}“
                {frist && <br />}
              </>
            )}
            {frist && (
              <>
                {fristKind === "einspruch" ? "Einspruch" : "Widerspruch"} muss danach bis spätestens <strong>{frist}</strong> eingehen
                {days !== undefined && days >= 0 && ` (noch ${days} Tage)`}
                {days !== undefined && days < 0 && " – vermutlich abgelaufen, bitte prüfen"}.
              </>
            )}
          </Fristbox>
        </div>
      )}

      {draft.remedyText && (
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          Rechtsbehelfsbelehrung: „{draft.remedyText}“{draft.remedy && REMEDY_LABEL[draft.remedy] ? ` → ${REMEDY_LABEL[draft.remedy]}` : ""}
        </p>
      )}

      <div className="stack" style={{ gap: 10, paddingTop: 22 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Was möchten Sie tun?
        </h2>
        {suggested.map((k, i) => (
          <button key={k} type="button" className={`tile${i === 0 ? " tile-best" : ""}`} onClick={() => choose(k)}>
            <span>{LETTER_KINDS[k].label}</span>
            <span className="hint">{i === 0 ? "passt am besten" : LETTER_KINDS[k].hint}</span>
          </button>
        ))}
        <details style={{ marginTop: 4 }}>
          <summary className="muted" style={{ fontSize: 13, cursor: "pointer" }}>
            Andere Briefart
          </summary>
          <div className="stack" style={{ gap: 8, paddingTop: 10 }}>
            {others.map((k) => (
              <button key={k} type="button" className="tile" onClick={() => choose(k)}>
                <span>{LETTER_KINDS[k].label}</span>
                {LETTER_KINDS[k].hint && <span className="hint">{LETTER_KINDS[k].hint}</span>}
              </button>
            ))}
            <button type="button" className="tile" onClick={() => choose("frei")}>
              <span>Freier Brief</span>
            </button>
          </div>
        </details>
      </div>

      <div className="screen-foot">
        <span className="muted" style={{ fontSize: 11, textAlign: "center" }}>
          Zusammenfassung durch KI aus Ihrem Foto – maßgeblich ist das Original. Keine Rechtsberatung; was zu tun ist, entscheiden Sie.
        </span>
      </div>
    </main>
  );
}
