"use client";
import { useEffect, useRef, useState } from "react";
import type { Address } from "@/lib/types";

interface Hit { name: string; street: string; zip: string; city: string; label: string }

/** Sucht die Anschrift einer Behörde/Firma (OSM, dann Websuche) und bietet Treffer zum Übernehmen an. */
export function AddressLookup({ query, hint, onPick }: { query: string; hint?: string; onPick: (a: Partial<Address>) => void }) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState<string>();

  async function search() {
    const q = [query, hint].filter(Boolean).join(" ").trim();
    if (q.length < 3) return;
    setBusy(true);
    setSearched(q);
    try {
      const res = await fetch(`/api/address?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { hits?: Hit[] };
      setHits(data.hits ?? []);
    } catch {
      setHits([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <button type="button" className="chip" disabled={busy || query.trim().length < 3} onClick={search} style={{ alignSelf: "flex-start" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{ marginRight: 6 }}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        {busy ? "Adresse wird gesucht …" : "Adresse suchen"}
      </button>
      {!busy && searched && hits.length === 0 && <span className="muted" style={{ fontSize: 12 }}>Nichts gefunden – bitte Straße und Ort eintragen (steht meist oben auf dem Schreiben).</span>}
      {hits.map((h, i) => (
        <button
          key={i}
          type="button"
          className="tile"
          style={{ minHeight: 48, padding: "10px 14px", fontWeight: 500 }}
          onClick={() => {
            onPick({ street: h.street, zip: h.zip, city: h.city });
            setHits([]);
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 600 }}>{h.name || query}</span>
            <span className="muted" style={{ fontSize: 13 }}>
              {h.street}, {h.zip} {h.city}
            </span>
          </span>
          <span className="hint">übernehmen</span>
        </button>
      ))}
    </div>
  );
}

/** PLZ → Ort automatisch, sobald 5 Ziffern eingegeben sind und der Ort leer ist. */
export function useZipToCity(zip: string, city: string, setCity: (c: string) => void) {
  const last = useRef<string>("");
  useEffect(() => {
    if (!/^\d{5}$/.test(zip) || city.trim() || last.current === zip) return;
    last.current = zip;
    fetch(`/api/address?zip=${zip}`)
      .then((r) => r.json())
      .then((d: { cities?: string[] }) => {
        if (d.cities?.length === 1 || (d.cities && d.cities.length > 1)) setCity(d.cities[0]);
      })
      .catch(() => {});
  }, [zip, city, setCity]);
}
