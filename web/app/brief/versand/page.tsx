"use client";
import { useState } from "react";
import { ScreenHead } from "@/components/ui";
import { useDraft } from "@/lib/store";
import { needsWrittenForm, missingDetails, hasBody } from "@/lib/formcheck";
import { PRICES, euro, type Shipping } from "@/lib/types";
import { subjectLine } from "@/lib/subject";

export default function VersandScreen() {
  const { draft, update, ready } = useDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  if (!ready) return null;

  const price = PRICES[draft.shipping];
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email);
  const detailsMissing = missingDetails(draft);
  const missing = !hasBody(draft) ? { text: "Der Brieftext fehlt – bitte den Entwurf noch einmal erstellen.", href: "/brief/entwurf", label: "Zum Entwurf" } : detailsMissing ? { text: detailsMissing, href: "/brief/daten", label: "Zu den Angaben" } : null;

  async function pay() {
    if (missing) {
      setError(missing.text);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft }) });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Zahlung konnte nicht gestartet werden");
      window.location.href = j.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Zahlung konnte nicht gestartet werden");
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <ScreenHead step={5} back="/brief/unterschrift" />
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingTop: 8 }}>
        <div className="letter" style={{ width: 72, padding: 8, gap: 4, flexShrink: 0 }} aria-hidden="true">
          <span style={{ height: 3, width: "60%", background: "var(--line)", borderRadius: 2 }} />
          <span style={{ height: 3, width: "40%", background: "var(--line)", borderRadius: 2, marginTop: 6 }} />
          <span style={{ height: 3, width: "100%", background: "var(--paper-200)", borderRadius: 2, marginTop: 8 }} />
          <span style={{ height: 3, width: "100%", background: "var(--paper-200)", borderRadius: 2 }} />
          <span style={{ height: 3, width: "80%", background: "var(--paper-200)", borderRadius: 2 }} />
        </div>
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ fontSize: 22 }}>Fast fertig</h1>
          <span className="muted" style={{ fontSize: 13, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {subjectLine(draft.kind, draft.subject, draft.documentDate)} · an {draft.recipient.name}
          </span>
          <button
            type="button"
            className="btn btn-link"
            style={{ width: "auto", minHeight: 40, padding: "0 2px", fontSize: 14, justifyContent: "flex-start" }}
            onClick={async () => {
              const res = await fetch("/api/letters/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ draft }) });
              if (!res.ok) return setError("Vorschau konnte nicht erzeugt werden");
              const url = URL.createObjectURL(await res.blob());
              window.open(url, "_blank", "noopener");
              setTimeout(() => URL.revokeObjectURL(url), 60_000);
            }}
          >
            PDF-Vorschau ansehen
          </button>
        </div>
      </div>

      {missing && (
        <div className="errorbox" style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ flex: 1 }}>{missing.text}</span>
          <a href={missing.href} className="chip" style={{ textDecoration: "none" }}>{missing.label}</a>
        </div>
      )}

      {needsWrittenForm(draft) && (
        <div className="errorbox" style={{ marginTop: 16 }}>
          <strong>Eigenhändige Unterschrift nötig.</strong> Bei der Kündigung eines Miet-, Pacht- oder Arbeitsvertrags gilt nur die Unterschrift von Hand – ein gedruckter Brief ist unwirksam. Wählen Sie „Nur PDF-Download“, drucken Sie aus und unterschreiben Sie selbst.
        </div>
      )}

      <div className="stack" style={{ paddingTop: 18, gap: 10 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Wie soll der Brief raus?
        </h2>
        {(Object.keys(PRICES) as Shipping[]).map((s) => (
          <label key={s} className={`opt${draft.shipping === s ? " sel" : ""}`}>
            <input type="radio" name="ship" checked={draft.shipping === s} onChange={() => update({ shipping: s })} />
            <span style={{ flex: 1 }}>
              <span className="t">
                <span>{PRICES[s].label}</span>
                <span>{euro(PRICES[s].cents)}</span>
              </span>
              <span className="h">{PRICES[s].hint}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="field" style={{ paddingTop: 14 }}>
        <label className="label" htmlFor="mail">
          E-Mail für Status &amp; Rechnung
        </label>
        <input id="mail" type="email" className="input" value={draft.email} onChange={(e) => update({ email: e.target.value })} autoComplete="email" required />
      </div>

      {error && <div className="errorbox" style={{ marginTop: 12 }}>{error}</div>}

      <div className="screen-foot">
        <button className="btn btn-primary" disabled={!emailOk || busy || !!missing} onClick={pay}>
          {busy ? "Weiter zur Zahlung …" : `Jetzt bezahlen & ${draft.shipping === "download" ? "herunterladen" : "versenden"} · ${euro(price.cents)}`}
        </button>
        <span className="muted" style={{ fontSize: 12, textAlign: "center", lineHeight: 1.4 }}>
          Preise inkl. MwSt. Zahlung per Karte, PayPal, Apple/Google Pay. Mit dem Kauf verlangen Sie ausdrücklich, dass wir sofort mit der Ausführung beginnen, und bestätigen, dass Ihr Widerrufsrecht mit vollständiger Ausführung erlischt (<a href="/widerruf">Widerrufsbelehrung</a>). Es gelten <a href="/agb">AGB</a> und <a href="/datenschutz">Datenschutzerklärung</a>.
        </span>
      </div>
    </main>
  );
}
