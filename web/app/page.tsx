import Link from "next/link";
import { Logo } from "@/components/ui";
import { LETTER_KINDS, PRICES, euro, type LetterKind } from "@/lib/types";
import { Uploader } from "@/components/uploader";
import { Footer } from "@/components/legal";
import { ResumeDraft } from "@/components/resume";
import { GUIDES } from "@/lib/guides";

const GROUPS: Array<{ title: string; kinds: LetterKind[] }> = [
  { title: "Behörde und Amt", kinds: ["widerspruch", "einspruch", "steuer", "unterlagen", "fristverlaengerung", "nachfrage"] },
  { title: "Wohnung", kinds: ["nebenkosten", "maengel"] },
  { title: "Geld und Sonstiges", kinds: ["mahnung", "beschwerde", "frei"] },
];

const Tick = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/** Beispiel-Bescheid als gerendertes Blatt – zeigt, was die Erkennung aus einem Foto holt. */
function DemoLetter() {
  return (
    <div className="demo" aria-label="Beispiel: Was Flinkbrief in einem Bescheid erkennt">
      <div className="sheet">
        <span className="fold" style={{ top: "33%" }} />
        <span className="fold" style={{ top: "66%" }} />
        <div className="hd">
          <div>
            <b>Polizei Berlin</b>
            <div className="ls">Zentrale Bußgeldstelle</div>
          </div>
          <div className="ls" style={{ textAlign: "right" }}>
            Az. <span className="mark">B-78/4412-26</span>
            <br />
            <span className="mark">14.10.2026</span>
          </div>
        </div>
        <div className="adr">
          Frau
          <br />
          Lena Hartmann
          <br />
          Kastanienallee 12
          <br />
          10435 Berlin
        </div>
        <div className="subj">Bußgeldbescheid – Überschreitung der zulässigen Höchstgeschwindigkeit</div>
        <p>
          am 29.09.2026 um 17:42 Uhr wurde mit dem Fahrzeug B-LH 311 auf der A 100 (Stadtring) die zulässige Höchstgeschwindigkeit innerhalb geschlossener Ortschaften
          um 24 km/h überschritten.
        </p>
        <p>
          Gegen Sie wird eine Geldbuße von <span className="mark">115,00 €</span> zuzüglich Gebühren und Auslagen in Höhe von 28,50 € festgesetzt.
        </p>
        <p>
          Gegen diesen Bescheid können Sie <span className="mark">innerhalb von zwei Wochen</span> nach Zustellung schriftlich Einspruch einlegen.
        </p>
        <div className="ls" style={{ marginTop: 10 }}>Rechtsbehelfsbelehrung · Seite 1 von 2</div>
      </div>
      <div className="notes">
        <div className="note n1">
          <b>Einspruch bis 2. Nov.</b>
          <small>Frist aus dem Bescheid berechnet</small>
        </div>
        <div className="note n2">
          <b>143,50 € gesamt</b>
          <small>Betrag erkannt</small>
        </div>
        <div className="note n3">
          <b>Einspruch formuliert</b>
          <small>mit Aktenzeichen, fertig zur Unterschrift</small>
        </div>
      </div>
    </div>
  );
}

export const metadata = { alternates: { canonical: "/" } };

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

export default function Home() {
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Organization", name: "Flinkbrief", url: base(), logo: `${base()}/flinkbrief-mark.svg`, email: "info@flinkbrief.de", areaServed: "DE" },
    { "@context": "https://schema.org", "@type": "WebSite", name: "Flinkbrief", url: base(), inLanguage: "de" },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Flinkbrief – Antwort auf Behördenpost per Post",
      serviceType: "Formulierungshilfe und Briefversand",
      provider: { "@type": "Organization", name: "Flinkbrief" },
      areaServed: "DE",
      offers: [
        { "@type": "Offer", name: "Brief per Post", price: (PRICES.post.cents / 100).toFixed(2), priceCurrency: "EUR" },
        { "@type": "Offer", name: "Einschreiben Einwurf", price: (PRICES.registered.cents / 100).toFixed(2), priceCurrency: "EUR" },
        { "@type": "Offer", name: "Nur PDF", price: (PRICES.download.cents / 100).toFixed(2), priceCurrency: "EUR" },
      ],
    },
  ];
  return (
    <main className="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="home-head">
        <Logo height={24} />
        <Link href="/status" className="quiet">
          Meine Briefe
        </Link>
      </div>

      <section className="hero">
        <h1>
          <span>Bescheid bekommen?</span> <span>Antwort in 5 Minuten.</span>
        </h1>
        <div className="hero-copy">
          <p className="lead">
            Brief fotografieren. Flinkbrief erklärt in einfachen Worten, was drinsteht und bis wann Sie reagieren müssen, schreibt den Widerspruch nach Ihren
            Angaben und schickt ihn per Post – unterschrieben mit dem Finger.
          </p>
          <div className="hero-cta">
            <ResumeDraft />
            <Uploader />
            <div className="trust">
              <span>
                <Tick /> Verstehen ist kostenlos
              </span>
              <span>
                <Tick /> Kein Konto nötig
              </span>
              <span>
                <Tick /> Foto wird nach der Erkennung gelöscht
              </span>
              <span>
                <Tick /> Ab {euro(PRICES.post.cents)} inkl. Porto
              </span>
            </div>
          </div>
        </div>
        <DemoLetter />
      </section>

      <section className="how">
        <h2>So läuft es</h2>
        <ol className="steps">
          <li>
            <strong>Fotografieren</strong>
            <span>Behörde, Aktenzeichen, Frist und Betrag werden erkannt. Nichts abtippen.</span>
          </li>
          <li>
            <strong>Verstehen und entscheiden</strong>
            <span>Kurze Erklärung, was der Brief bedeutet. Sie wählen: Widerspruch, Unterlagen nachreichen, Nachfrage oder mehr Zeit.</span>
          </li>
          <li>
            <strong>Unterschreiben und abschicken</strong>
            <span>Entwurf prüfen, mit dem Finger unterschreiben, als Brief oder Einschreiben versenden. Oder als PDF selbst einwerfen.</span>
          </li>
        </ol>
      </section>

      <section className="kinds">
        <h2>Ohne Foto anfangen</h2>
        <p className="sub">Briefart wählen, dann tippen oder diktieren, worum es geht. Den Rest formuliert Flinkbrief.</p>
        <div className="kind-groups">
          {GROUPS.map((g) => (
            <div className="kind-group" key={g.title}>
              <h3>{g.title}</h3>
              {g.kinds.map((k) => (
                <Link key={k} href={`/brief/daten?kind=${k}`} className="kind">
                  <span>{LETTER_KINDS[k].label}</span>
                  {LETTER_KINDS[k].hint && <small>{LETTER_KINDS[k].hint}</small>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="prices">
        <h2>Was es kostet</h2>
        <p className="sub">Verstehen ist kostenlos. Sie zahlen erst, wenn Sie den Brief verschicken oder als PDF herunterladen.</p>
        <p className="distinct">
          <strong>Nicht nur ein PDF.</strong> Flinkbrief druckt, kuvertiert und verschickt den Brief – auf Wunsch als Einschreiben mit Zustellnachweis. Drucker, Umschlag und Gang zur Post entfallen. Wer lieber selbst unterschreibt, nimmt das PDF.
        </p>
        <div className="price-list">
        <div className="price hi">
          <span className="amt">
            {euro(PRICES.post.cents)}
            <small>inkl. MwSt.</small>
          </span>
          <span className="nm">Brief per Post</span>
          <span className="ds">Druck, Umschlag und Porto. An Werktagen bis 12 Uhr noch am selben Tag bei der Post.</span>
        </div>
        <div className="price">
          <span className="amt">
            {euro(PRICES.registered.cents)}
            <small>inkl. MwSt.</small>
          </span>
          <span className="nm">Einschreiben Einwurf</span>
          <span className="ds">Mit Zustellnachweis. Empfohlen, wenn eine Frist läuft.</span>
        </div>
        <div className="price">
          <span className="amt">
            {euro(PRICES.download.cents)}
            <small>inkl. MwSt.</small>
          </span>
          <span className="nm">Nur PDF</span>
          <span className="ds">Selbst drucken, unterschreiben und einwerfen. Nötig bei Miet- und Arbeitsvertrag.</span>
        </div>
        </div>
      </section>

      <section className="kinds" aria-label="Ratgeber">
        <h2>Erst verstehen, dann antworten</h2>
        <p className="sub">Was im Schreiben steht, welche Frist läuft und was Sie tun können – je Bescheid-Typ kurz erklärt.</p>
        <div className="guide-list">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/ratgeber/${g.slug}`} className="guide-card">
              <strong>{g.title}</strong>
              <small>{g.deadlineShort}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="honest">
        <h2>Was Sie wissen sollten</h2>
        <div>
          <b>Keine Rechtsberatung</b>
          Flinkbrief formuliert nach Ihren Angaben und prüft die Form. Ob ein Widerspruch Erfolg hat, kann nur ein Anwalt beurteilen.
        </div>
        <div>
          <b>Fristen bleiben Ihre Sache</b>
          Wir rechnen die Frist aus dem Bescheid aus und zeigen sie an. Verantwortlich für den rechtzeitigen Versand sind Sie.
        </div>
        <div>
          <b>Daten nur so lange wie nötig</b>
          Das Foto wird nach der Erkennung gelöscht, Brief und Bestellung nach 30 Tagen. Kein Konto, kein Newsletter.
        </div>
      </section>

      <Footer />
    </main>
  );
}
