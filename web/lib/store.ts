"use client";
import { useEffect, useState } from "react";
import type { Draft, LetterKind } from "./types";

const KEY = "flinkbrief.draft.v1";

const empty: Draft = {
  kind: "widerspruch",
  recipient: { name: "", name2: "", street: "", zip: "", city: "", country: "DE" },
  sender: { name: "", name2: "", street: "", zip: "", city: "", country: "DE" },
  reference: "",
  documentDate: "",
  subject: "",
  reason: "",
  body: "",
  shipping: "post",
  email: "",
};

export function loadDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as Partial<Draft>) } : { ...empty };
  } catch {
    return { ...empty };
  }
}
export function saveDraft(d: Draft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* privater Modus o. ä. – Flow läuft trotzdem im State weiter */
  }
}
export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** Hook: Entwurf aus sessionStorage, Änderungen werden sofort gesichert. */
export function useDraft() {
  const [draft, setDraft] = useState<Draft>(empty);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setDraft(loadDraft());
    setReady(true);
  }, []);
  const update = (patch: Partial<Draft> | ((d: Draft) => Partial<Draft>)) =>
    setDraft((d) => {
      const next = { ...d, ...(typeof patch === "function" ? patch(d) : patch) };
      saveDraft(next);
      return next;
    });
  return { draft, update, ready };
}

export function startDraft(kind: LetterKind) {
  const d = { ...empty, kind };
  saveDraft(d);
  return d;
}
