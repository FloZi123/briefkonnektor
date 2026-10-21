"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Field } from "@/components/ui";
import { Footer } from "@/components/legal";

export default function StatusPage() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/orders/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, email }) });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Abfrage fehlgeschlagen");
      router.push(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Abfrage fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <div className="screen-head">
        <Logo />
      </div>
      <div className="stack" style={{ gap: 6, paddingTop: 16 }}>
        <h1 style={{ fontSize: 24 }}>Meine Briefe</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          Status abrufen und PDF erneut laden – ohne Kundenkonto. Bestellnummer und E-Mail stehen in Ihrer Bestätigung.
        </p>
      </div>
      <form className="stack" style={{ paddingTop: 18 }} onSubmit={lookup}>
        <Field label="Bestellnummer" id="oid">
          <input id="oid" className="input mono" value={id} onChange={(e) => setId(e.target.value)} placeholder="FB-2026-XXXXXX" autoCapitalize="characters" autoComplete="off" required />
        </Field>
        <Field label="E-Mail-Adresse der Bestellung" id="omail">
          <input id="omail" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </Field>
        {error && <div className="errorbox">{error}</div>}
        <button className="btn btn-primary" disabled={busy || !id || !email} type="submit">
          {busy ? "Wird gesucht …" : "Status anzeigen"}
        </button>
        <span className="muted" style={{ fontSize: 11, textAlign: "center" }}>
          Bestellungen und PDFs werden 30 Tage nach der Bestellung automatisch gelöscht.
        </span>
      </form>
      <Footer />
    </main>
  );
}
