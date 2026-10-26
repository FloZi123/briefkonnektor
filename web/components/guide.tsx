import Link from "next/link";
import { Logo } from "@/components/ui";
import { Footer } from "@/components/legal";
import { GUIDES, type Guide } from "@/lib/guides";
import { LETTER_KINDS, PRICES, euro } from "@/lib/types";
import { Attribution } from "@/components/attribution";

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

/** Ratgeber-Artikel; campaign = Kennung einer Anzeigen-Einstiegsseite (/a/…), wird lokal gemerkt und an der Bestellung mitgeführt. */
export function GuideArticle({ g, campaign }: { g: Guide; campaign?: string }) {
  const kind = LETTER_KINDS[g.kind];
  const start = `/brief/daten?kind=${g.kind}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.title,
      description: g.description,
      inLanguage: "de",
      author: { "@type": "Organization", name: "Flinkbrief" },
      publisher: { "@type": "Organization", name: "Flinkbrief", url: base() },
      mainEntityOfPage: `${base()}/ratgeber/${g.slug}`,
    },
  ];

  return (
    <main className="guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {campaign && <Attribution campaign={campaign} />}
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
          <p className="eyebrow">Ratgeber</p>
          <h1>{g.title}</h1>
          <p className="lead">{g.description}</p>
          <div className="fristbox" role="note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>
              <strong>Frist:</strong> {g.deadline}
            </span>
          </div>
        </header>

        <aside className="guide-cta">
          <strong>Direkt loslegen</strong>
          <p>{g.cta}</p>
          <Link href="/" className="btn btn-primary">
            Brief fotografieren
          </Link>
          <Link href={start} className="btn btn-secondary">
            Ohne Foto: {kind.label}
          </Link>
          <span className="muted">
            Versand {euro(PRICES.post.cents)} · Einschreiben {euro(PRICES.registered.cents)} · PDF {euro(PRICES.download.cents)}
          </span>
        </aside>

        {g.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="elsewhere">
          <h2>Wann ein Brief allein nicht reicht</h2>
          <p>Flinkbrief hält die Frist und bringt Ihren Standpunkt formgerecht auf den Weg. In diesen Fällen holen Sie sich zusätzlich Hilfe:</p>
          <ul>
            {g.elsewhere.map((li) => (
              <li key={li}>{li}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Häufige Fragen</h2>
          <dl className="faq">
            {g.faq.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="guide-foot">
          <p className="muted">
            Dieser Ratgeber informiert allgemein über Fristen, Form und Ablauf. Er ersetzt keine Rechtsberatung im Einzelfall. Flinkbrief formuliert Ihren Brief nach Ihren Angaben und prüft die Form – ob ein {kind.label.split(" ")[0]} in Ihrem Fall Erfolg hat, kann nur ein Anwalt beurteilen. Für die Einhaltung von Fristen sind Sie verantwortlich.
          </p>
          <p className="muted">
            Weitere Ratgeber:{" "}
            {GUIDES.filter((r) => r.slug !== g.slug).map((r, i) => (
              <span key={r.slug}>
                {i > 0 && " · "}
                <Link href={`/ratgeber/${r.slug}`}>{r.title}</Link>
              </span>
            ))}
          </p>
        </section>
      </article>
      <Footer />
    </main>
  );
}
