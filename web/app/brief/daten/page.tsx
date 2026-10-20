"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenHead, Fristbox, Field, Disclaimer } from "@/components/ui";
import { useDictation, DictateButton, appendText } from "@/components/dictate";
import { useDraft } from "@/lib/store";
import { LETTER_KINDS, type LetterKind } from "@/lib/types";
import { widerspruchsfrist, daysUntil } from "@/lib/dates";

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

  if (!ready) return null;
  const kind = LETTER_KINDS[draft.kind];
  const frist = draft.kind === "widerspruch" ? widerspruchsfrist(draft.documentDate) : undefined;
  const days = frist ? daysUntil(frist) : undefined;
  const fromPhoto = params.get("from") === "photo";

  const setR = (k: keyof typeof draft.recipient, v: string) => update((d) => ({ recipient: { ...d.recipient, [k]: v } }));
  const setS = (k: keyof typeof draft.sender, v: string) => update((d) => ({ sender: { ...d.sender, [k]: v } }));

  const valid = draft.recipient.name && draft.recipient.street && draft.recipient.zip && draft.recipient.city && draft.sender.name && draft.sender.street && draft.sender.zip && draft.sender.city && draft.subject;

  return (
    <main className="screen">
      <ScreenHead step={2} back="/" />
      <div className="stack" style={{ gap: 6, paddingTop: 8 }}>
        <h1 style={{ fontSize: 24 }}>{fromPhoto ? "Das haben wir erkannt" : kind.label}</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          {fromPhoto ? "Bitte kurz prüfen – Fehler im Aktenzeichen kosten Zeit." : "Wer bekommt den Brief, und worum geht es?"}
        </p>
      </div>

      {frist && (
        <div style={{ paddingTop: 14 }}>
          <Fristbox>
            <strong>Widerspruchsfrist laut Bescheid: 1 Monat.</strong> Bescheid vom {draft.documentDate} → Eingang bei der Behörde bis spätestens <strong>{frist}</strong>
            {days !== undefined && days >= 0 && ` (noch ${days} Tage)`}
            {days !== undefined && days < 0 && " – Frist vermutlich abgelaufen; bitte prüfen."}
          </Fristbox>
        </div>
      )}

      <form
        className="stack"
        style={{ paddingTop: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
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

        <span className="label" style={{ marginTop: 8 }}>
          Empfänger
        </span>
        <Field label="Behörde / Firma / Person" id="rname">
          <input id="rname" className="input" value={draft.recipient.name} onChange={(e) => setR("name", e.target.value)} placeholder="z. B. Jobcenter Schwandorf" required />
        </Field>
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
        <Field label="Worum geht es?" id="subject">
          <input id="subject" className="input" value={draft.subject} onChange={(e) => update({ subject: e.target.value })} placeholder="z. B. Rückforderung Leistungen Juli–Sept. 2026" required />
        </Field>
        <Field label="Was möchten Sie sagen? Tippen oder diktieren – Stichpunkte reichen" id="reason">
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

        <span className="label" style={{ marginTop: 8 }}>
          Ihre Angaben (Absender)
        </span>
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
          <button className="btn btn-primary" type="submit" disabled={!valid}>
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
