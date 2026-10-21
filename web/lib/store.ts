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

const TTL_MS = 24 * 60 * 60 * 1000; // Entwurf bleibt 24 h erhalten (auch bei Tab-Wechsel, Kamera, Stripe, Neustart des Browsers)

function storage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return undefined;
    }
  }
}

export function loadDraft(): Draft {
  try {
    const st = storage();
    const raw = st?.getItem(KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as Partial<Draft> & { savedAt?: number };
    if (parsed.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
      st?.removeItem(KEY);
      return { ...empty };
    }
    const { savedAt: _ignored, ...d } = parsed;
    void _ignored;
    return { ...empty, ...d };
  } catch {
    return { ...empty };
  }
}
export function saveDraft(d: Draft) {
  try {
    storage()?.setItem(KEY, JSON.stringify({ ...d, savedAt: Date.now() }));
  } catch {
    /* privater Modus o. ä. – Flow läuft trotzdem im State weiter */
  }
}
/** Gibt es einen angefangenen Brief? (für „Entwurf fortsetzen“ auf der Startseite) */
export function hasDraft(): { step: string; label: string } | null {
  const d = loadDraft();
  if (d.body) return { step: d.signature ? "/brief/versand" : "/brief/entwurf", label: d.recipient.name ? `${d.recipient.name}` : "Ihr Entwurf" };
  if (d.recipient.name || d.subject || d.reason) return { step: "/brief/daten", label: d.recipient.name || "Ihre Angaben" };
  return null;
}
export function clearDraft() {
  try {
    storage()?.removeItem(KEY);
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
