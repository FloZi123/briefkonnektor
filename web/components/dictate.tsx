"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Diktat über die Spracherkennung des Browsers (Web Speech API, Deutsch).
 * Läuft in Chrome, Edge, Safari (macOS/iOS) und Android-Browsern; wo sie fehlt, wird der Knopf nicht gerendert.
 * Erkannter Text wird satzweise an onText übergeben; nichts verlässt den Browser über unseren Server.
 */
type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecCtor = new () => Rec;

function getCtor(): RecCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function useDictation(onText: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const rec = useRef<Rec | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => {
    setSupported(!!getCtor());
    return () => rec.current?.abort();
  }, []);

  function start() {
    const Ctor = getCtor();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "de-DE";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let pending = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const t = res[0].transcript;
        if (res.isFinal) cb.current(t.trim());
        else pending += t;
      }
      setInterim(pending.trim());
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
      rec.current = null;
    };
    r.onerror = () => {
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    setListening(true);
    r.start();
  }

  function stop() {
    rec.current?.stop();
  }

  return { supported, listening, interim, toggle: () => (listening ? stop() : start()) };
}

/** Mikrofon-Knopf; sitzt rechts unter einem Textfeld. */
export function DictateButton({ listening, supported, interim, onClick }: { listening: boolean; supported: boolean; interim: string; onClick: () => void }) {
  if (!supported) return null;
  return (
    <div className="dictate">
      <button type="button" className={`dictate-btn${listening ? " is-on" : ""}`} onClick={onClick} aria-pressed={listening}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
        </svg>
        {listening ? "Aufnahme läuft – tippen zum Stoppen" : "Diktieren"}
      </button>
      {listening && <span className="dictate-interim">{interim || "Sprechen Sie einfach los …"}</span>}
    </div>
  );
}

/** Hängt diktierten Text mit Leerzeichen an einen vorhandenen Text an. */
export const appendText = (prev: string, add: string) => (prev.trim() ? `${prev.replace(/\s+$/, "")} ${add}` : add);
