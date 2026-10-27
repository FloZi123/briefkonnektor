"use client";
import { useRouter } from "next/navigation";
import { ScreenHead, Check } from "@/components/ui";
import { SignaturePad } from "@/components/signature";
import { useDraft } from "@/lib/store";
import { track } from "@/lib/track";

export default function UnterschriftScreen() {
  const { draft, update, ready } = useDraft();
  const router = useRouter();
  if (!ready) return null;

  return (
    <main className="screen">
      <ScreenHead step={4} back="/brief/entwurf" />
      <div className="stack" style={{ gap: 6, paddingTop: 8 }}>
        <h1 style={{ fontSize: 24 }}>Unterschreiben</h1>
        <p className="muted" style={{ fontSize: 13 }}>
          Mit dem Finger im Feld unterschreiben. Die Unterschrift wird auf den Brief gedruckt.
        </p>
      </div>

      <div style={{ paddingTop: 16 }}>
        <SignaturePad value={draft.signature} onChange={(s) => update({ signature: s })} />
      </div>

      <div className="notice" style={{ marginTop: 20, flexDirection: "column", gap: 8 }}>
        <strong>Was die gedruckte Unterschrift leistet</strong>
        <span style={{ display: "flex", gap: 8 }}>
          <Check />
          <span>Widerspruch, Mahnung, Beschwerde, Mängelanzeige: vollständig und glaubwürdig.</span>
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--frist)" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span>Miet- oder Arbeitsvertrag kündigen: nur Original-Unterschrift gilt – dafür im nächsten Schritt „Download“ wählen und selbst unterschreiben.</span>
        </span>
      </div>

      <div className="screen-foot">
        <button
          className="btn btn-primary"
          onClick={() => {
            track(draft.signature ? "signature_done" : "signature_skipped");
            router.push("/brief/versand");
          }}
        >
          Vorschau &amp; Versandart
        </button>
        <button className="btn btn-link" onClick={() => { track("signature_skipped"); update({ signature: undefined }); router.push("/brief/versand"); }}>
          Ohne Unterschrift weiter
        </button>
      </div>
    </main>
  );
}
