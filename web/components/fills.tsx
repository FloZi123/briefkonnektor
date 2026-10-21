"use client";
import { useState } from "react";
import type { FillSuggestion } from "@/lib/ai";

/**
 * Lücken-Assistent: ein Block je Platzhalter – Frage, Vorschläge zum Antippen, eigenes Feld.
 * Übernehmen ersetzt den Platzhalter im Brieftext; der Nutzer muss ihn nicht selbst suchen.
 */
export function FillAssistant({ placeholders, fills, loading, onFill }: { placeholders: string[]; fills: FillSuggestion[]; loading: boolean; onFill: (placeholder: string, value: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const first = placeholders[0];
  const info = fills.find((f) => f.placeholder === first);
  const label = first.replace(/^\[|\]$/g, "");
  const val = values[first] ?? "";

  return (
    <div className="fillbox">
      <div className="title">
        <span className="count">{placeholders.length}</span>
        {placeholders.length === 1 ? "Eine Angabe fehlt noch" : `${placeholders.length} Angaben fehlen noch`}
      </div>
      <div className="q">
        <span className="ph">{label}</span>
        <span>{info?.question ?? (loading ? "Vorschläge werden gesucht …" : `Was soll hier stehen?`)}</span>
      </div>
      {info && info.suggestions.length > 0 && (
        <div className="row" style={{ gap: 8 }}>
          {info.suggestions.map((s) => (
            <button key={s} type="button" className="chip chip-suggest" onClick={() => onFill(first, s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="row"
        style={{ gap: 8, alignItems: "stretch" }}
        onSubmit={(e) => {
          e.preventDefault();
          onFill(first, val);
          setValues((v) => ({ ...v, [first]: "" }));
        }}
      >
        <input className="input" style={{ flex: 1, minHeight: 44 }} value={val} onChange={(e) => setValues((v) => ({ ...v, [first]: e.target.value }))} placeholder="Eigene Angabe eintippen" autoFocus />
        <button type="submit" className="btn btn-primary" style={{ width: "auto", minHeight: 44, padding: "0 16px" }} disabled={!val.trim()}>
          Übernehmen
        </button>
      </form>
      {placeholders.length > 1 && (
        <span className="muted" style={{ fontSize: 12 }}>
          Danach: {placeholders.slice(1, 4).map((p) => p.replace(/^\[|\]$/g, "")).join(" · ")}
          {placeholders.length > 4 ? " …" : ""}
        </span>
      )}
    </div>
  );
}
