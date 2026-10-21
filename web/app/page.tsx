import Link from "next/link";
import { Logo } from "@/components/ui";
import { LETTER_KINDS, PRICES, euro } from "@/lib/types";
import { Uploader } from "@/components/uploader";
import { Footer } from "@/components/legal";

export default function Home() {
  return (
    <main className="screen">
      <div className="screen-head" style={{ justifyContent: "space-between" }}>
        <Logo height={24} />
        <Link href="/status" className="muted" style={{ fontSize: 13, textDecoration: "none" }}>
          Meine Briefe
        </Link>
      </div>

      <div className="stack" style={{ gap: 10, paddingTop: 16 }}>
        <span className="eyebrow">Behördenpost verstehen und beantworten</span>
        <h1 style={{ fontSize: 30 }}>Bescheid bekommen? Verstehen, antworten, abschicken.</h1>
        <p className="muted" style={{ fontSize: 14 }}>
          Foto machen – wir erklären in einfachen Worten, was drinsteht und bis wann Sie reagieren sollten. Dann schreiben wir die Antwort nach Ihren
          Angaben und schicken sie per Post. Auf Wunsch als Einschreiben.
        </p>
      </div>

      <div style={{ paddingBlock: 20 }}>
        <Uploader />
        <p className="muted" style={{ marginTop: 10, fontSize: 12, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Foto wird nach der Erkennung sofort gelöscht
        </p>
      </div>

      <ol className="steps">
        <li>
          <strong>Brief fotografieren</strong>
          <span>Behörde, Aktenzeichen, Frist und Inhalt werden erkannt – nichts abtippen.</span>
        </li>
        <li>
          <strong>Verstehen und entscheiden</strong>
          <span>Kurze Erklärung in einfacher Sprache. Sie wählen: Widerspruch, Unterlagen nachreichen, Nachfrage, mehr Zeit.</span>
        </li>
        <li>
          <strong>Prüfen, unterschreiben, abschicken</strong>
          <span>Entwurf anpassen, mit dem Finger unterschreiben, als Brief oder Einschreiben versenden – oder als PDF laden.</span>
        </li>
      </ol>

      <div className="stack" style={{ gap: 10 }}>
        <span className="label">Oder ohne Foto: Briefart wählen, dann tippen oder diktieren, worum es geht</span>
        {(Object.keys(LETTER_KINDS) as Array<keyof typeof LETTER_KINDS>).map((k) => (
          <Link key={k} href={`/brief/daten?kind=${k}`} className="tile">
            <span>{LETTER_KINDS[k].label}</span>
            {LETTER_KINDS[k].hint && <span className="hint">{LETTER_KINDS[k].hint}</span>}
          </Link>
        ))}
      </div>

      <div className="screen-foot" style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 12 }}>
        <span className="muted">
          Versand ab {euro(PRICES.post.cents)} · Download {euro(PRICES.download.cents)}
        </span>
        <span className="muted">inkl. MwSt.</span>
      </div>
      <Footer />
    </main>
  );
}
