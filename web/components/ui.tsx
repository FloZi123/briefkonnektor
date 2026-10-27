"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Logo({ height = 24 }: { height?: number }) {
  // Wortmarke in Ink-Farbe: im Dark Mode die helle Variante, sonst verschwindet „flink“ auf dunklem Grund
  return (
    <picture>
      <source srcSet="/flinkbrief-lockup-dark.svg" media="(prefers-color-scheme: dark)" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/flinkbrief-lockup.svg" alt="Flinkbrief" style={{ height, width: "auto", display: "block" }} />
    </picture>
  );
}

const STEPS = ["Verstehen", "Angaben", "Entwurf", "Unterschrift", "Versand"];

export function ScreenHead({ step, back }: { step?: number; back?: string }) {
  const router = useRouter();
  return (
    <>
      <div className="screen-head">
        {back !== undefined ? (
          <button className="btn-icon" aria-label="Zurück" onClick={() => (back ? router.push(back) : router.back())}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <Link href="/" aria-label="Zur Startseite" style={{ display: "inline-flex" }}>
            <Logo />
          </Link>
        )}
        {back !== undefined && (
          <Link href="/" style={{ marginLeft: "auto", display: "inline-flex" }} aria-label="Zur Startseite">
            <Logo height={20} />
          </Link>
        )}
      </div>
      {step !== undefined && (
        <div className="stepbar" aria-label={`Schritt ${step} von ${STEPS.length}: ${STEPS[step - 1]}`}>
          <div className="segs" aria-hidden="true">
            {STEPS.map((s, i) => (
              <i key={s} className={i + 1 < step ? "done" : i + 1 === step ? "now" : ""} />
            ))}
          </div>
          <div className="meta">
            <span>
              <b>{STEPS[step - 1]}</b>
              {step < STEPS.length && <span className="muted"> · dann {STEPS[step]}</span>}
            </span>
            <span>
              {step} / {STEPS.length}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export function Fristbox({ children }: { children: React.ReactNode }) {
  return (
    <div className="fristbox" role="status">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function Check({ color = "var(--zugestellt)" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

export const Disclaimer = () => (
  <span className="muted" style={{ fontSize: 12, textAlign: "center" }}>
    Formulierungshilfe nach Ihren Angaben, keine Rechtsberatung. Fristen liegen in Ihrer Verantwortung.
  </span>
);
