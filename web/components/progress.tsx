"use client";
import { useEffect, useState } from "react";

/** Sichtbare Wartezeit: Schritte, die nacheinander „abgehakt“ werden, plus Balken mit Restzeit-Schätzung. */
export function Progress({ steps, seconds }: { steps: string[]; seconds: number }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 0.25), 250);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(96, (t / seconds) * 100);
  const active = Math.min(steps.length - 1, Math.floor((t / seconds) * steps.length));
  return (
    <div className="progress" role="status" aria-live="polite">
      <div className="bar">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <ul>
        {steps.map((s, i) => (
          <li key={s} className={i < active ? "done" : i === active ? "now" : ""}>
            <span className="dot" />
            {s}
            {i === active && " …"}
          </li>
        ))}
      </ul>
      <span className="muted" style={{ fontSize: 12 }}>{t < seconds ? `etwa ${Math.max(1, Math.round(seconds - t))} Sekunden` : "dauert heute etwas länger – bitte kurz warten"}</span>
    </div>
  );
}
