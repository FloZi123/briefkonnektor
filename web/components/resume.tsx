"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { hasDraft, clearDraft } from "@/lib/store";

/** Startseite: angefangenen Brief fortsetzen oder verwerfen. */
export function ResumeDraft() {
  const [d, setD] = useState<{ step: string; label: string } | null>(null);
  useEffect(() => setD(hasDraft()), []);
  if (!d) return null;
  return (
    <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{ flex: 1, fontSize: 14 }}>
        <strong>Angefangener Brief:</strong> {d.label}
      </span>
      <Link href={d.step} className="chip" style={{ borderColor: "var(--flink)", color: "var(--flink)", textDecoration: "none" }}>
        Fortsetzen
      </Link>
      <button
        type="button"
        className="btn-link btn"
        style={{ width: "auto", minHeight: 0, padding: 0, fontSize: 13 }}
        onClick={() => {
          clearDraft();
          setD(null);
        }}
      >
        Verwerfen
      </button>
    </div>
  );
}

/** Bestätigungsseite: Entwurf nach erfolgreicher Bestellung aus dem Speicher nehmen. */
export function ClearDraftOnDone() {
  useEffect(() => clearDraft(), []);
  return null;
}
