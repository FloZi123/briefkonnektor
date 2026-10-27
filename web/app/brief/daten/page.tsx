"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenHead, Fristbox, Field, Disclaimer } from "@/components/ui";
import { useDictation, DictateButton, appendText } from "@/components/dictate";
import { AddressLookup, useZipToCity } from "@/components/address";
import { useDraft } from "@/lib/store";
import { LETTER_KINDS, type LetterKind } from "@/lib/types";
import { widerspruchsfrist, einspruchsfrist, steuerfrist, daysUntil } from "@/lib/dates";
import { missingDetails } from "@/lib/formcheck";

function DatenScreen() {
  const { draft, update, ready } = useDraft();
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const k = params.get("kind") as LetterKind | null;
    if (k && LETTER_KINDS[k] && ready && draft.kind !== k) update({ kind: k });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, params]);

  const dictate = useDictation((t) => update((d) => ({ reason: appendText(d.reason, t) })));
  useZipToCity(draft.recipient.zip, draft.recipient.city, (c) => update((d) => ({ recipient: { ...d.recipient, city: c } })));
  useZipToCity(draft.sender.zip, draft.sender.city, (c) => update((d) => ({ sender: { ...d.sender, city: c } })));

  if (!ready) return null;
  const kind = LETTER_KINDS[draft.kind];
  const frist = draft.kind === "widerspruch" ? widerspruchsfrist(draft.documentDate) : draft.kind === "einspruch" ? einspruchsfrist(draft.documentDate) : draft.kind === "steuer" ? steuerfrist(draft.documentDate) : undefined;
  const remedyMismatch =
    draft.remedy && draft.remedy !== "keine" && ((draft.remedy === "einspruch" && draft.kind === "widerspruch") || (draft.remedy === "widerspruch" && (draft.kind === "einspruch" || draft.kind === "steuer")) || (draft.remedy === "klage" && (draft.kind === "widerspruch" || draft.kind === "einspruch" || draft.kind === "steuer")));
  const days = frist ? daysUntil(frist) : undefined;
  const fromPhoto = params.get("from") === "photo";

  const setR = (k: keyof typeof draft.recipient, v: string) => update((d) => ({ recipient: { ...d.recipient, [k]: v } }));
  const setS = (k: keyof typeof draft.sender, v: string) => update((d) => ({ sender: { ...d.sender, [k]: v } }));

  const missing = missingDetails(draft);
  // Hinweis erst, wenn alles ausgefüllt aussieht, aber z. B. die PLZ nicht stimmt – sonst sagt der gesperrte Knopf nicht, warum
  const looksFilled = [draft.recipient.name, draft.recipient.street, draft.recipient.zip, draft.recipient.city, draft.subject, draft.sender.name, draft.sender.street, draft.sender.zip, draft.sender.city].every((v) => v && v.length > 0);

  return (
    <main className="screen">
      <ScreenHead step={2} back={draft.understanding?.summary ? "/brief/verstehen" : "/"} />
      <div className="stack" style={{ gap: 6, paddingTop: 8 }}>
        <h1 style={{ fontSize: 24 }}>{fromPhoto ? "Das haben wir erkannt" : kind.label}</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          {fromPhoto ? "Bitte kurz prüfen – Fehler im Aktenzeichen kosten Zeit." : "Wer bekommt den Brief, und worum geht es?"}
        </p>
      </div>

      {frist && (
        <div style={{ paddingTop: 14 }}>
          <Fristbox>
            <strong>{draft.kind === "einspruch" ? "Einspruchsfrist: 2 Wochen ab Zustellung." : draft.kind === "steuer" ? "Einspruchsfrist: 1 Monat ab Bekanntgabe (§ 355 AO)." : "Widerspruchsfrist: 1 Monat ab Bekanntgabe."}</strong> Bescheid vom {draft.documentDate} → Eingang bei der Behörde bis spätestens <strong>{frist}</strong>
            {days !== undefined && days >= 0 && ` (noch ${days} Tage).`}
            {days !== undefined && days < 0 && " – Frist vermutlich abgelaufen; bitte prüfen."}
            {days === undefined && "."}
            {" "}
            {draft.kind === "einspruch" ? "Gerechnet mit Zustellung drei Tage nach dem Bescheiddatum – maßgeblich ist das Datum auf dem gelben Umschlag." : "Gerechnet mit Bekanntgabe vier Tage nach dem Bescheiddatum; ging er Ihnen nachweislich später zu, zählt der tatsächliche Zugang."}{" "}
            Maßgeblich ist die Rechtsbehelfsbelehrung auf dem Bescheid.{" "}
            <a href={`/fristrechner?art=${draft.kind === "einspruch" ? "bussgeld" : draft.kind === "steuer" ? "steuer" : "widerspruch"}`} target="_blank" rel="noopener" className="frist-link">
              Genau berechnen
            </a>
          </Fristbox>
        </div>
      )}

      {remedyMismatch && (
        <div className="errorbox" style={{ marginTop: 12 }}>
          <strong>Rechtsbehelf prüfen:</strong> Laut Belehrung auf dem Bescheid ist „{{ einspruch: "Einspruch", widerspruch: "Widerspruch", klage: "Klage", beschwerde: "Beschwerde" }[draft.remedy as "einspruch" | "widerspruch" | "klage" | "beschwerde"]}“ vorgesehen
          {draft.remedyText ? ` („${draft.remedyText}“)` : ""}. {draft.remedy === "klage" ? "Ein Brief reicht dann in der Regel nicht – bitte Belehrung lesen oder beraten lassen." : "Bitte die passende Briefart oben wählen."}
        </div>
      )}

      <form
        className="stack"
        style={{ paddingTop: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (missing) return;
          update({ deadline: frist });
          router.push("/brief/entwurf");
        }}
      >
        <Field label="Briefart" id="kind">
          <select id="kind" className="input" value={draft.kind} onChange={(e) => update({ kind: e.target.value as LetterKind })}>
            {(Object.keys(LETTER_KINDS) as LetterKind[]).map((k) => (
              <option key={k} value={k}>
                {LETTER_KINDS[k].label}
              </option>
            ))}
          </select>
        </Field>

        <h2 className="section-title">Empfänger</h2>
        <Field label="Behörde / Firma / Person" id="rname">
          <input id="rname" className="input" value={draft.recipient.name} onChange={(e) => setR("name", e.target.value)} placeholder="z. B. Jobcenter Schwandorf" required />
        </Field>
        {!draft.recipient.street && (
          <AddressLookup query={draft.recipient.name} hint={draft.recipient.city} onPick={(a) => update((d) => ({ recipient: { ...d.recipient, ...a } }))} />
        )}
        <Field label="Zusatz (optional)" id="rname2">
          <input id="rname2" className="input" value={draft.recipient.name2 ?? ""} onChange={(e) => setR("name2", e.target.value)} placeholder="Abteilung, z. Hd." />
        </Field>
        <Field label="Straße und Hausnummer" id="rstreet">
          <input id="rstreet" className="input" value={draft.recipient.street} onChange={(e) => setR("street", e.target.value)} required />
        </Field>
        <div className="grid2">
          <Field label="PLZ" id="rzip">
            <input id="rzip" className="input" inputMode="numeric" value={draft.recipient.zip} onChange={(e) => setR("zip", e.target.value)} required />
          </Field>
          <Field label="Ort" id="rcity">
            <input id="rcity" className="input" value={draft.recipient.city} onChange={(e) => setR("city", e.target.value)} required />
          </Field>
        </div>
        <div className="grid2">
          <Field label="Aktenzeichen / Nummer" id="ref">
            <input id="ref" className="input mono" value={draft.reference} onChange={(e) => update({ reference: e.target.value })} placeholder="optional" />
          </Field>
          <Field label="Datum des Schreibens" id="date">
            <input id="date" className="input" value={draft.documentDate} onChange={(e) => update({ documentDate: e.target.value })} placeholder="TT.MM.JJJJ" />
          </Field>
        </div>
        <h2 className="section-title">Worum es geht</h2>
        <Field label="Betrag laut Schreiben (falls genannt)" id="amount">
          <input id="amount" className="input" value={draft.amount ?? ""} onChange={(e) => update({ amount: e.target.value })} placeholder="z. B. 94,00 €" inputMode="decimal" />
        </Field>
        {draft.understanding?.keyFacts && draft.understanding.keyFacts.length > 0 && (
          <div className="notice" style={{ flexDirection: "column", gap: 4 }}>
            <strong style={{ fontSize: 13 }}>Aus dem Schreiben erkannt – wird im Brief verwendet</strong>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              {draft.understanding.keyFacts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
        <Field label="Thema in einem Satz" id="subject">
          <input id="subject" className="input" value={draft.subject} onChange={(e) => update({ subject: e.target.value })} placeholder="z. B. Rückforderung Leistungen Juli–Sept. 2026" required />
        </Field>
        <Field label="Was möchten Sie sagen? Stichpunkte reichen, tippen oder diktieren" id="reason">
          <textarea
            id="reason"
            className="input"
            style={{ minHeight: 130 }}
            value={draft.reason}
            onChange={(e) => update({ reason: e.target.value })}
            placeholder="z. B. „Ich war an dem Tag gar nicht in München, mein Chef kann das bestätigen. Ich will Akteneinsicht und dass der Bescheid aufgehoben wird.“"
          />
          <DictateButton {...dictate} onClick={dictate.toggle} />
        </Field>

        <h2 className="section-title">Ihre Adresse als Absender</h2>
        <Field label="Ihr Name" id="sname">
          <input id="sname" className="input" value={draft.sender.name} onChange={(e) => setS("name", e.target.value)} required autoComplete="name" />
        </Field>
        <Field label="Straße und Hausnummer" id="sstreet">
          <input id="sstreet" className="input" value={draft.sender.street} onChange={(e) => setS("street", e.target.value)} required autoComplete="street-address" />
        </Field>
        <div className="grid2">
          <Field label="PLZ" id="szip">
            <input id="szip" className="input" inputMode="numeric" value={draft.sender.zip} onChange={(e) => setS("zip", e.target.value)} required autoComplete="postal-code" />
          </Field>
          <Field label="Ort" id="scity">
            <input id="scity" className="input" value={draft.sender.city} onChange={(e) => setS("city", e.target.value)} required autoComplete="address-level2" />
          </Field>
        </div>

        <div className="screen-foot">
          {missing && looksFilled && (
            <p className="errorbox" role="status">
              {missing}
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={!!missing}>
            Entwurf erstellen
          </button>
          <Disclaimer />
        </div>
      </form>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <DatenScreen />
    </Suspense>
  );
}
