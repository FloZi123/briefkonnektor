"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { berechneFrist, FRIST_ARTEN, type FristArt, type Zugang } from "@/lib/frist";
import { Fristbox } from "@/components/ui";
import { track } from "@/lib/track";

const fmt = (d: Date) => d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const ZUGANG: Record<Zugang, string> = {
  post: "Normaler Brief – ich nehme das Datum vom Schreiben",
  zustellung: "Gelber Umschlag mit Zustelldatum (förmliche Zustellung)",
  erhalten: "Ich weiß, wann er angekommen ist – ich gebe dieses Datum an",
};

/** Welche Zugangsarten je Fristart sinnvoll sind */
const ZUGAENGE: Record<FristArt, Zugang[]> = {
  widerspruch: ["post", "zustellung", "erhalten"],
  steuer: ["post", "erhalten"],
  bussgeld: ["zustellung", "erhalten"],
  mahnbescheid: ["zustellung", "erhalten"],
  nebenkosten: ["erhalten"],
  klage: ["zustellung", "erhalten"],
};

export function Fristrechner({ initialArt }: { initialArt?: FristArt }) {
  const [art, setArt] = useState<FristArt>(initialArt && FRIST_ARTEN[initialArt] ? initialArt : "widerspruch");
  const [zugang, setZugang] = useState<Zugang>(ZUGAENGE[initialArt ?? "widerspruch"][0]);
  const [datum, setDatum] = useState<string>("");

  const zugaenge = ZUGAENGE[art];
  const zugangEff = zugaenge.includes(zugang) ? zugang : zugaenge[0];

  const result = useMemo(() => {
    if (!datum) return undefined;
    const d = new Date(datum + "T12:00:00");
    if (isNaN(d.getTime())) return undefined;
    return berechneFrist({ art, datum: d, zugang: zugangEff });
  }, [art, datum, zugangEff]);

  // frist_calculated erst, wenn die Eingabe eine Sekunde steht – beim Tippen des Jahres entstehen sonst Zwischenwerte (0002, 0020 …)
  const lastSent = useRef("");
  useEffect(() => {
    if (!result) return;
    const key = `${art}|${zugangEff}|${datum}`;
    const t = setTimeout(() => {
      if (lastSent.current === key) return;
      lastSent.current = key;
      track("frist_calculated", { art, zugang: zugangEff });
    }, 1000);
    return () => clearTimeout(t);
  }, [result, art, zugangEff, datum]);

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const rest = result ? Math.round((result.ende.getTime() - heute.getTime()) / 86_400_000) : undefined;
  const meta = FRIST_ARTEN[art];

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="field">
        <label className="label" htmlFor="art">
          Worum geht es?
        </label>
        <select
          id="art"
          className="input"
          value={art}
          onChange={(e) => {
            const a = e.target.value as FristArt;
            setArt(a);
            setZugang(ZUGAENGE[a][0]);
          }}
        >
          {(Object.keys(FRIST_ARTEN) as FristArt[]).map((k) => (
            <option key={k} value={k}>
              {FRIST_ARTEN[k].label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="label">Wie kam das Schreiben an?</span>
        <div className="stack" style={{ gap: 8 }}>
          {zugaenge.map((z) => (
            <label key={z} className={`opt${zugangEff === z ? " sel" : ""}`}>
              <input type="radio" name="zugang" checked={zugangEff === z} onChange={() => setZugang(z)} />
              <span style={{ flex: 1 }}>
                <span className="t">
                  <span>{ZUGANG[z]}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="datum">
          {zugangEff === "post" ? "Datum auf dem Schreiben" : zugangEff === "zustellung" ? "Zustelldatum (auf dem gelben Umschlag)" : "Angekommen am"}
        </label>
        <input id="datum" type="date" className="input" value={datum} max={iso(new Date(heute.getFullYear() + 1, 11, 31))} onChange={(e) => setDatum(e.target.value)} />
      </div>

      {result && (
        <div className="stack" style={{ gap: 12 }} aria-live="polite">
          <Fristbox>
            <strong>Spätestens am {fmt(result.ende)}</strong> muss der Brief bei der Stelle eingegangen sein
            {rest !== undefined && rest >= 0 && ` – noch ${rest} ${rest === 1 ? "Tag" : "Tage"}`}
            {rest !== undefined && rest < 0 && " – dieser Tag liegt in der Vergangenheit"}.
          </Fristbox>
          <div className="checks">
            <strong>So ist gerechnet</strong>
            <ul>
              <li>
                Frist läuft ab {fmt(result.start)}
                {result.fiktion ? " (Tag der Bekanntgabe)" : ""}.
              </li>
              <li>
                Dauer {result.dauer} ({result.normen}).
              </li>
              {result.hinweise.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
          {rest !== undefined && rest >= 0 && rest <= 7 && (
            <div className="errorbox">
              <strong>Knapp.</strong> Bei weniger als einer Woche: per Einwurf-Einschreiben oder persönlich abgeben und sich den Eingang bestätigen lassen. Eine Begründung kann nachgereicht werden – erst die Frist wahren.
            </div>
          )}
          {meta.kind && (
            <div className="stack" style={{ gap: 8 }}>
              <Link href={meta.guide ? `/ratgeber/${meta.guide}` : "/ratgeber"} className="btn btn-secondary">
                Was in den Brief gehört
              </Link>
              <Link href={`/brief/daten?kind=${meta.kind}`} className="btn btn-primary">
                Brief jetzt schreiben und per Post schicken
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
