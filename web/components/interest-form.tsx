"use client";
import { useState } from "react";
import { Field } from "@/components/ui";
import { getAttribution } from "@/lib/store";
import { track } from "@/lib/track";

/**
 * Interessenten-Formular für „prüfen lassen“ (Vermittlungs-Test).
 * Ehrlich: Es gibt noch keinen Partner. Wir sammeln E-Mail + PLZ und melden uns, sobald einer steht.
 */
export function InterestForm({ anlass }: { anlass: string }) {
  const [email, setEmail] = useState("");
  const [plz, setPlz] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/interesse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, plz, anlass, consent, campaign: getAttribution() }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Speichern hat nicht geklappt.");
      track("check_submitted", { anlass, plz: plz ? plz.slice(0, 2) : "" }); // nur PLZ-Region, keine Adresse
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern hat nicht geklappt.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="reviewbox ok" role="status">
        <strong>Danke – wir melden uns.</strong>
        <br />
        Sie bekommen eine E-Mail, sobald ein Partner in Ihrer Region prüfen kann, mit Preis und Ablauf. Erst dann entscheiden Sie.
      </div>
    );
  }

  return (
    <form className="stack" style={{ gap: 14 }} onSubmit={submit}>
      <Field label="E-Mail-Adresse" id="imail">
        <input id="imail" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
      </Field>
      <Field label="Postleitzahl (optional, für einen Partner in Ihrer Nähe)" id="iplz">
        <input id="iplz" className="input mono" value={plz} onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" autoComplete="postal-code" placeholder="z. B. 80331" />
      </Field>
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        <span>
          Flinkbrief darf mich zu diesem Anliegen per E-Mail kontaktieren. Die Adresse wird nur dafür verwendet und nicht an Dritte weitergegeben, bevor ich zustimme. Widerruf jederzeit per E-Mail an info@flinkbrief.de.
        </span>
      </label>
      {error && <div className="errorbox">{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={busy || !email || !consent}>
        {busy ? "Wird gespeichert …" : "Prüfung anfragen – unverbindlich"}
      </button>
      <span className="muted" style={{ fontSize: 12, textAlign: "center" }}>
        Kostenlos und unverbindlich. Preis und Ablauf nennen wir Ihnen vorher.
      </span>
    </form>
  );
}
