import Link from "next/link";
import { Logo } from "@/components/ui";
import { PRICES, euro } from "@/lib/types";
import { Uploader } from "@/components/uploader";
import { Footer } from "@/components/legal";
import { ResumeDraft } from "@/components/resume";
import { GUIDES } from "@/lib/guides";

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
            Brief fotografieren. Flinkbrief erklärt, was drinsteht und bis wann Sie reagieren müssen, schreibt die Antwort nach Ihren Angaben und schickt sie per Post.
          </p>
          <div className="hero-cta">
            <ResumeDraft />
            <Uploader />
            <p className="alt-start">
              Kein Foto zur Hand? <Link href="/brief/daten">Briefart wählen →</Link>
            </p>
            <div className="trust">
              <span>
                <Tick /> Verstehen kostenlos
              </span>
              <span>
                <Tick /> Kein Konto
              </span>
              <span>
                <Tick /> Foto wird gelöscht
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
            <span>Behörde, Aktenzeichen, Frist und Betrag werden erkannt.</span>
          </li>
          <li>
            <strong>Verstehen und entscheiden</strong>
            <span>Sie lesen in einfachen Worten, was verlangt wird, und wählen Ihre Antwort.</span>
          </li>
          <li>
            <strong>Unterschreiben und abschicken</strong>
            <span>Mit dem Finger unterschreiben – wir drucken und verschicken.</span>
          </li>
        </ol>
        <p className="price-line">
          Brief per Post <b>{euro(PRICES.post.cents)}</b> · Einschreiben mit Nachweis <b>{euro(PRICES.registered.cents)}</b> · Nur PDF <b>{euro(PRICES.download.cents)}</b> – inkl. MwSt. Verstehen ist kostenlos.
        </p>
      </section>

      <section className="guides-short">
        <h2>Ratgeber</h2>
        <ul className="guide-links">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/ratgeber/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
          <li>
            <Link href="/fristrechner">Fristrechner: letzten Tag der Frist ausrechnen</Link>
          </li>
        </ul>
      </section>

      <section className="honest">
        <h2>Was Sie wissen sollten</h2>
        <div>
          <b>Keine Rechtsberatung</b>
          Wir formulieren nach Ihren Angaben und prüfen die Form, nicht die Erfolgsaussicht.
        </div>
        <div>
          <b>Fristen bleiben Ihre Sache</b>
          Wir zeigen die Frist an, rechtzeitig abschicken müssen Sie.
        </div>
        <div>
          <b>Daten nur so lange wie nötig</b>
          Foto gelöscht nach der Erkennung, Brief nach 30 Tagen. Kein Konto.
        </div>
      </section>

      <Footer />
    </main>
  );
}
