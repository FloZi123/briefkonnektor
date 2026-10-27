import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { Footer } from "@/components/legal";
import { Fristrechner } from "@/components/fristrechner";
import { FRIST_ARTEN, type FristArt } from "@/lib/frist";

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Fristrechner: Widerspruch, Einspruch, Mahnbescheid",
  description: "Bis wann muss der Widerspruch da sein? Bekanntgabe, Monatsfrist, Wochenende und Feiertage – Datum eingeben, Fristende sehen. Für Bescheid, Steuer, Bußgeld, Mahnbescheid, Nebenkosten.",
  alternates: { canonical: "/fristrechner" },
};

const FAQ = [
  {
    q: "Ab wann läuft die Widerspruchsfrist?",
    a: "Ab Bekanntgabe des Bescheids. Kommt er mit normaler Post, gilt er am vierten Tag nach dem Datum des Bescheids als bekannt gegeben (§ 41 Abs. 2 VwVfG, § 37 Abs. 2 SGB X, § 122 Abs. 2 AO, seit 2025). Fällt dieser Tag auf ein Wochenende oder einen Feiertag, gilt der nächste Werktag. Bei förmlicher Zustellung zählt das Datum auf dem gelben Umschlag.",
  },
  {
    q: "Zählt das Absenden oder der Eingang?",
    a: "Der Eingang bei der Behörde, beim Gericht oder beim Vermieter. Ein am letzten Tag abgeschickter Brief ist zu spät. Ein Einwurf-Einschreiben belegt den Zugangstag.",
  },
  {
    q: "Was passiert, wenn das Fristende auf ein Wochenende fällt?",
    a: "Die Frist endet am nächsten Werktag (§ 193 BGB, § 222 ZPO, § 43 StPO, § 108 Abs. 3 AO). Samstage sind keine Werktage im Sinne dieser Regel. Bundesweite Feiertage berücksichtigt der Rechner; regionale Feiertage können das Ende um einen Tag verschieben.",
  },
  {
    q: "Wie lang ist die Frist bei einem Bußgeldbescheid?",
    a: "Zwei Wochen ab Zustellung (§ 67 OWiG). Bußgeldbescheide werden förmlich zugestellt; das Datum steht auf dem gelben Umschlag. Es gibt keine Bekanntgabefiktion.",
  },
  {
    q: "Was gilt bei der Nebenkostenabrechnung?",
    a: "Einwendungen sind bis zum Ablauf des zwölften Monats nach Zugang der Abrechnung möglich (§ 556 Abs. 3 BGB). Belegeinsicht können Sie jederzeit verlangen.",
  },
  {
    q: "Frist verpasst – ist alles verloren?",
    a: "Nicht immer: Waren Sie ohne eigenes Verschulden verhindert, kommt Wiedereinsetzung in den vorigen Stand in Betracht (§ 32 VwVfG, § 27 SGB X, § 110 AO, § 52 OWiG). Der Antrag muss kurz nach Wegfall des Hindernisses gestellt und die versäumte Handlung nachgeholt werden. Ob die Voraussetzungen vorliegen, beurteilt im Zweifel eine Beratungsstelle oder ein Anwalt.",
  },
];

export default async function FristrechnerPage({ searchParams }: { searchParams: Promise<{ art?: string }> }) {
  const { art } = await searchParams;
  const initial = art && (art as FristArt) in FRIST_ARTEN ? (art as FristArt) : undefined;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Fristrechner für Widerspruch und Einspruch",
      url: `${base()}/fristrechner`,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      inLanguage: "de",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      publisher: { "@type": "Organization", name: "Flinkbrief", url: base() },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Flinkbrief", item: base() },
        { "@type": "ListItem", position: 2, name: "Fristrechner", item: `${base()}/fristrechner` },
      ],
    },
  ];

  return (
    <main className="guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="home-head">
        <Link href="/" aria-label="Zur Startseite" style={{ display: "inline-flex" }}>
          <Logo height={24} />
        </Link>
        <Link href="/ratgeber" className="quiet">
          Alle Ratgeber
        </Link>
      </div>
      <article className="guide-body">
        <header className="guide-head">
          <p className="eyebrow">Fristrechner</p>
          <h1>Bis wann muss der Widerspruch da sein?</h1>
          <p className="lead">
            Datum eingeben, Fristende sehen. Der Rechner wendet die gesetzlichen Regeln an: Bekanntgabe am vierten Tag, Monatsfrist nach § 188 BGB, Verschiebung bei Wochenende und bundesweiten Feiertagen. Keine Rechtsberatung – maßgeblich bleibt die Rechtsbehelfsbelehrung auf Ihrem Schreiben.
          </p>
        </header>

        <Fristrechner initialArt={initial} />

        <section>
          <h2>Die Regeln im Überblick</h2>
          <ul>
            <li>
              <strong>Widerspruch</strong> (Jobcenter, Krankenkasse, Rentenversicherung, Verwaltung): 1 Monat ab Bekanntgabe – § 70 VwGO, § 84 SGG.
            </li>
            <li>
              <strong>Einspruch gegen den Steuerbescheid:</strong> 1 Monat ab Bekanntgabe – § 355 AO; Bekanntgabe am 4. Tag nach Aufgabe zur Post, § 122 Abs. 2 AO.
            </li>
            <li>
              <strong>Einspruch gegen den Bußgeldbescheid:</strong> 2 Wochen ab Zustellung – § 67 OWiG.
            </li>
            <li>
              <strong>Widerspruch gegen den Mahnbescheid:</strong> 2 Wochen ab Zustellung – § 694 ZPO.
            </li>
            <li>
              <strong>Einwendungen gegen die Nebenkostenabrechnung:</strong> 12 Monate ab Zugang – § 556 Abs. 3 BGB.
            </li>
            <li>
              <strong>Klage nach Widerspruchsbescheid:</strong> 1 Monat ab Zustellung – § 74 VwGO, § 87 SGG.
            </li>
          </ul>
        </section>

        <section>
          <h2>Häufige Fragen</h2>
          <dl className="faq">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="guide-foot">
          <p className="muted">
            Der Rechner gibt die gesetzlichen Fristregeln wieder und ersetzt keine Rechtsberatung. Steht in der Rechtsbehelfsbelehrung Ihres Schreibens etwas anderes, gilt die Belehrung. Ist sie fehlerhaft oder fehlt sie, verlängert sich die Frist in vielen Fällen auf ein Jahr (§ 58 VwGO, § 66 SGG, § 356 AO) – auch das beurteilt im Zweifel eine Beratungsstelle.
          </p>
        </section>
      </article>
      <Footer />
    </main>
  );
}
