"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHead, Disclaimer } from "@/components/ui";
import { useDictation, DictateButton, appendText } from "@/components/dictate";
import { Progress } from "@/components/progress";
import { FillAssistant } from "@/components/fills";
import { useDraft } from "@/lib/store";
import { subjectLine } from "@/lib/subject";
import { findPlaceholders } from "@/lib/placeholders";
import { formCheck } from "@/lib/formcheck";
import type { ReviewPoint, FillSuggestion } from "@/lib/ai";

const TAG: Record<ReviewPoint["kind"] | "form" | "rechtsbehelf" | "schriftform", string> = { fehlt: "fehlt", beleg: "Beleg", anlage: "Anlage", widerspruch: "prüfen", hinweis: "Hinweis", form: "Form", rechtsbehelf: "Rechtsbehelf", schriftform: "Schriftform" };

const CHIPS: Array<{ label: string; instruction: string }> = [
  { label: "Sachlicher", instruction: "Formuliere nüchterner und sachlicher, ohne Emotionen." },
  { label: "Kürzer", instruction: "Kürze den Brief auf das Wesentliche, maximal halb so lang." },
  { label: "Begründung ergänzen", instruction: "Ergänze einen Absatz, der die Begründung ausführlicher darlegt, ohne neue Fakten zu erfinden; nutze Platzhalter in eckigen Klammern, wo Angaben fehlen." },
  { label: "Fristverlängerung bitten", instruction: "Ergänze die Bitte um Fristverlängerung zur Nachreichung einer ausführlichen Begründung." },
  { label: "Akteneinsicht", instruction: "Ergänze die Bitte um Akteneinsicht." },
];

const GEN_STEPS = ["Angaben werden gelesen", "Brief wird formuliert", "Entwurf wird geprüft"];
const EDIT_STEPS = ["Wunsch wird eingearbeitet", "Brief wird überarbeitet"];

export default function EntwurfScreen() {
  const { draft, update, ready } = useDraft();
  const [busy, setBusy] = useState<"init" | "chip" | null>(null);
  const [error, setError] = useState<string>();
  const [wish, setWish] = useState("");
  const [review, setReview] = useState<ReviewPoint[] | null>(null);
  const [fills, setFills] = useState<FillSuggestion[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviewedBody, setReviewedBody] = useState("");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const dictate = useDictation((t) => setWish((w) => appendText(w, t)));
  const router = useRouter();

  async function generate(instruction?: string) {
    setBusy(instruction ? "chip" : "init");
    setError(undefined);
    try {
      const res = await fetch("/api/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft, instruction }) });
      if (!res.ok) throw new Error((await res.json()).error ?? "Entwurf konnte nicht erstellt werden");
      const { body } = (await res.json()) as { body: string };
      update({ body });
      if (instruction) {
        setWish("");
        setAdjustOpen(false);
      }
      void runReview(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entwurf konnte nicht erstellt werden");
    } finally {
      setBusy(null);
    }
  }

  async function runReview(body: string) {
    if (!body || body === reviewedBody) return;
    setReviewing(true);
    try {
      const res = await fetch("/api/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft: { ...draft, body } }) });
      const data = (await res.json()) as { points?: ReviewPoint[]; fills?: FillSuggestion[] };
      setReview(data.points ?? []);
      setFills(data.fills ?? []);
      setReviewedBody(body);
    } catch {
      setReview([]);
    } finally {
      setReviewing(false);
    }
  }

  /** Platzhalter im Text durch den Wert ersetzen (alle Vorkommen). */
  function fill(placeholder: string, value: string) {
    const v = value.trim();
    if (!v) return;
    update((d) => ({ body: d.body.split(placeholder).join(v) }));
  }

  useEffect(() => {
    if (ready && !draft.body) void generate();
    else if (ready && draft.body) void runReview(draft.body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return null;
  const placeholders = findPlaceholders(draft.body);
  const form = formCheck(draft);
  const hints = [...form.map((f) => ({ tag: TAG[f.kind], text: f.text, warn: f.severity === "warn" })), ...(review ?? []).map((r) => ({ tag: TAG[r.kind], text: r.text, warn: false }))];
  const complete = placeholders.length === 0 && hints.length === 0 && review !== null && !reviewing;

  return (
    <main className="screen">
      <ScreenHead step={3} back="/brief/daten" />
      <div className="stack" style={{ gap: 6, paddingTop: 8 }}>
        <h1 style={{ fontSize: 24 }}>Ihr Entwurf</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          {placeholders.length > 0 ? "Erst die fehlenden Angaben ergänzen, dann den Text prüfen." : "Text direkt im Feld ändern oder unten anpassen lassen."}
        </p>
      </div>

      <div className="stack" style={{ paddingTop: 14, flex: "1 1 auto" }}>
        <div className="card" style={{ padding: "12px 14px", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="muted">
            An: {draft.recipient.name}
            {draft.reference && (
              <>
                {" · "}
                <span className="mono">Az. {draft.reference}</span>
              </>
            )}
          </span>
          <strong>{subjectLine(draft.kind, draft.subject, draft.documentDate)}</strong>
        </div>

        {busy && <Progress steps={busy === "init" ? GEN_STEPS : EDIT_STEPS} seconds={busy === "init" ? 18 : 12} />}

        {error && (
          <div className="errorbox">
            {error}{" "}
            <button className="btn-link btn" style={{ width: "auto", minHeight: 0, padding: 0, display: "inline" }} onClick={() => generate()}>
              Noch einmal versuchen
            </button>
          </div>
        )}

        {!busy && draft.body && placeholders.length > 0 && <FillAssistant placeholders={placeholders} fills={fills} loading={reviewing && fills.length === 0} onFill={fill} />}

        {!busy && draft.body && (
          <textarea
            id="body"
            className="input"
            style={{ minHeight: 300, fontSize: 15 }}
            value={draft.body}
            onChange={(e) => update({ body: e.target.value })}
            onBlur={() => void runReview(draft.body)}
          />
        )}

        {!busy && draft.body && placeholders.length === 0 && (hints.length > 0 || reviewing || review !== null) && (
          <div className={`reviewbox${complete ? " ok" : ""}`} aria-live="polite">
            <div className="title">
              {complete ? "Sieht vollständig aus" : "Vor der Unterschrift prüfen"}
              {reviewing && <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>· wird geprüft …</span>}
            </div>
            {hints.length > 0 && (
              <ul>
                {hints.map((h, i) => (
                  <li key={i} className={h.warn ? "warn" : ""}>
                    <span className="tag">{h.tag}</span>
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!busy && draft.body && (
          <details className="adjust" open={adjustOpen} onToggle={(e) => setAdjustOpen((e.target as HTMLDetailsElement).open)}>
            <summary>Entwurf anpassen lassen</summary>
            <div className="stack" style={{ gap: 10, paddingTop: 10 }}>
              <div className="row" style={{ gap: 8 }}>
                {CHIPS.map((c) => (
                  <button key={c.label} type="button" className="chip" onClick={() => generate(c.instruction)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <textarea
                id="wish"
                className="input"
                style={{ minHeight: 72 }}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Oder in eigenen Worten, tippen oder diktieren: „Erwähne, dass ich seit 2019 nie zu spät gezahlt habe, und bitte um Ratenzahlung.“"
              />
              <div className="row" style={{ gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                <DictateButton {...dictate} onClick={dictate.toggle} />
                <button type="button" className="chip" style={{ borderColor: "var(--flink)", color: "var(--flink)" }} disabled={!wish.trim()} onClick={() => generate(wish.trim())}>
                  Anpassen
                </button>
              </div>
            </div>
          </details>
        )}
      </div>

      <div className="screen-foot">
        <button className="btn btn-primary" disabled={!draft.body || busy !== null || placeholders.length > 0} onClick={() => router.push("/brief/unterschrift")}>
          {placeholders.length > 0 ? `Noch ${placeholders.length} Angabe${placeholders.length > 1 ? "n" : ""} ergänzen` : "Weiter zur Unterschrift"}
        </button>
        <Disclaimer />
      </div>
    </main>
  );
}
