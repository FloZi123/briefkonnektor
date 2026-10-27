import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { Footer } from "@/components/legal";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Ratgeber: Bescheide verstehen & beantworten",
  description: "Fristen, Form und Ablauf bei Bußgeld, Jobcenter, Nebenkosten, Mahnung, Rundfunkbeitrag, Steuer, Krankenkasse und Rente – kurz erklärt, mit Weg zum Brief.",
  alternates: { canonical: "/ratgeber" },
};

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

/** Themengruppen für die Übersicht – jede Gruppe eine H2, damit die Seite Struktur bekommt */
const GROUPS: Array<{ h: string; slugs: string[] }> = [
  { h: "Bußgeld, Jobcenter, Rundfunkbeitrag", slugs: ["einspruch-bussgeldbescheid", "widerspruch-jobcenter-bescheid", "widerspruch-rundfunkbeitrag"] },
  { h: "Steuer, Krankenkasse, Rente", slugs: ["einspruch-steuerbescheid", "widerspruch-krankenkasse", "widerspruch-rentenversicherung"] },
  { h: "Miete und Forderungen", slugs: ["widerspruch-nebenkostenabrechnung", "mahnung-widersprechen"] },
];

export default function RatgeberIndex() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Ratgeber: Bescheide verstehen und beantworten",
      url: `${base()}/ratgeber`,
      inLanguage: "de",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: GUIDES.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.title, url: `${base()}/ratgeber/${g.slug}` })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Flinkbrief", item: base() },
        { "@type": "ListItem", position: 2, name: "Ratgeber", item: `${base()}/ratgeber` },
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
        <Link href="/status" className="quiet">
          Meine Briefe
        </Link>
      </div>
      <div className="guide-body">
        <header className="guide-head">
          <p className="eyebrow">Ratgeber</p>
          <h1>Bescheid bekommen? Das steht drin, das können Sie tun.</h1>
          <p className="lead">Je Schreiben: welche Frist läuft, welche Form nötig ist und was nach dem Brief passiert. Kurz, ohne Juristendeutsch.</p>
        </header>
        {GROUPS.map((grp) => (
          <section key={grp.h}>
            <h2>{grp.h}</h2>
            <div className="guide-list">
              {grp.slugs.map((slug) => GUIDES.find((g) => g.slug === slug)).filter((g): g is (typeof GUIDES)[number] => !!g).map((g) => (
                <Link key={g.slug} href={`/ratgeber/${g.slug}`} className="guide-card">
                  <strong>{g.title}</strong>
                  <span>{g.description}</span>
                  <small>{g.deadlineShort}</small>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section>
          <h2>So geht es nach dem Lesen weiter</h2>
          <p>
            Bescheid fotografieren, in einfachen Worten verstehen, Brief formulieren lassen, mit dem Finger unterschreiben – und Flinkbrief schickt ihn per Post oder Einschreiben. Verstehen ist kostenlos, Sie zahlen nur den Versand.
          </p>
          <Link href="/" className="btn btn-primary" style={{ maxWidth: 320 }}>
            Brief fotografieren
          </Link>
        </section>
      </div>
      <Footer />
    </main>
  );
}
