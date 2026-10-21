"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDraft, loadDraft } from "@/lib/store";
import type { Extracted } from "@/lib/types";
import { validateFile, prepareFile } from "@/lib/upload";

/** Foto/PDF aufnehmen oder hochladen → /api/extract → Entwurf vorbefüllen → Schritt 2 */
export function Uploader() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  async function onFile(raw: File) {
    setError(undefined);
    const problem = validateFile(raw);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const file = await prepareFile(raw);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erkennung fehlgeschlagen");
      const x = (await res.json()) as Extracted;
      const d = loadDraft();
      saveDraft({
        ...d,
        kind: x.kind ?? "widerspruch",
        recipient: { ...d.recipient, ...(x.recipient ?? {}) } as typeof d.recipient,
        sender: { ...d.sender, ...(x.sender ?? {}) } as typeof d.sender,
        reference: x.reference ?? d.reference,
        documentDate: x.documentDate ?? d.documentDate,
        subject: x.subject ?? d.subject,
        remedy: x.remedy,
        remedyText: x.remedyText,
        amount: x.amount ?? d.amount,
        understanding: { documentType: x.documentType, summary: x.summary, demand: x.demand, deadlineHint: x.deadlineHint, options: x.options, keyFacts: x.keyFacts },
      });
      router.push(x.summary ? "/brief/verstehen" : "/brief/daten?from=photo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erkennung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <button
        type="button"
        className={`dropzone${busy ? " busy" : ""}`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void onFile(f);
        }}
        disabled={busy}
        aria-busy={busy}
      >
        <span className="camera">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
            <circle cx="12" cy="12.5" r="3.5" />
          </svg>
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>
          {busy ? "Wird erkannt …" : "Bescheid oder Vertrag fotografieren"}
        </span>
        <span className="muted" style={{ fontSize: 13 }}>
          oder PDF hochladen
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*,.heic,.heif,application/pdf"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = "";
        }}
      />
      {error && <div className="errorbox">{error}</div>}
    </div>
  );
}
