"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHead, Disclaimer } from "@/components/ui";
import { useDraft } from "@/lib/store";
import { subjectLine } from "@/lib/subject";

const CHIPS: Array<{ label: string; instruction: string }> = [
  { label: "Sachlicher", instruction: "Formuliere nüchterner und sachlicher, ohne Emotionen." },
  { label: "Kürzer", instruction: "Kürze den Brief auf das Wesentliche, maximal halb so lang." },
  { label: "Begründung ergänzen", instruction: "Ergänze einen Absatz, der die Begründung ausführlicher darlegt, ohne neue Fakten zu erfinden; nutze Platzhalter in eckigen Klammern, wo Angaben fehlen." },
  { label: "Fristverlängerung bitten", instruction: "Ergänze die Bitte um Fristverlängerung zur Nachreichung einer ausführlichen Begründung." },
  { label: "Akteneinsicht", instruction: "Ergänze die Bitte um Akteneinsicht." },
];

export default function EntwurfScreen() {
  const { draft, update, ready } = useDraft();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function generate(instruction?: string) {
    setBusy(instruction ? "chip" : "init");
    setError(undefined);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draft, instruction }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Entwurf konnte nicht erstellt werden");
      const { body } = (await res.json()) as { body: string };
      update({ body });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Entwurf konnte nicht erstellt werden");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (ready && !draft.body) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return null;

  return (
    <main className="screen">
      <ScreenHead step={3} back="/brief/daten" />
      <div className="stack" style={{ gap: 6, paddingTop: 8 }}>
        <h1 style={{ fontSize: 24 }}>Ihr Entwurf</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          Text direkt ändern, oder unten anpassen lassen.
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
        <textarea
          id="body"
          className="input"
          style={{ minHeight: 320, fontSize: 15 }}
          value={busy === "init" ? "Entwurf wird geschrieben …" : draft.body}
          onChange={(e) => update({ body: e.target.value })}
          disabled={busy !== null}
          aria-busy={busy !== null}
        />
        {error && (
          <div className="errorbox">
            {error}{" "}
            <button className="btn-link btn" style={{ width: "auto", minHeight: 0, padding: 0, display: "inline" }} onClick={() => generate()}>
              Noch einmal versuchen
            </button>
          </div>
        )}
        <div className="row" style={{ gap: 8 }}>
          {CHIPS.map((c) => (
            <button key={c.label} type="button" className="chip" disabled={busy !== null || !draft.body} onClick={() => generate(c.instruction)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-foot">
        <button className="btn btn-primary" disabled={!draft.body || busy !== null} onClick={() => router.push("/brief/unterschrift")}>
          Weiter zur Unterschrift
        </button>
        <Disclaimer />
      </div>
    </main>
  );
}
