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
    <div className="resume">
      <span className="eyebrow">Angefangener Brief</span>
      <strong style={{ fontSize: 17 }}>{d.label}</strong>
      <span className="muted" style={{ fontSize: 13 }}>Ihre Angaben und der Entwurf sind gespeichert (24 Stunden).</span>
      <div className="row" style={{ gap: 10, marginTop: 6 }}>
        <Link href={d.step} className="btn btn-primary" style={{ flex: 1 }}>
          Weitermachen
        </Link>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: "auto", padding: "0 16px" }}
          onClick={() => {
            clearDraft();
            setD(null);
          }}
        >
          Neu anfangen
        </button>
      </div>
    </div>
  );
}

/** Bestätigungsseite: Entwurf nach erfolgreicher Bestellung aus dem Speicher nehmen. */
export function ClearDraftOnDone() {
  useEffect(() => clearDraft(), []);
  return null;
}
