import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { Footer } from "@/components/legal";
import { InterestForm } from "@/components/interest-form";
import { TrackOnce } from "@/components/track-once";

export const metadata: Metadata = {
  title: "Prüfen lassen",
  robots: { index: false, follow: false },
};

/**
 * Test der Vermittlungsidee: Wer eine inhaltliche Prüfung will (nicht nur einen Brief), hinterlässt seine E-Mail.
 * Concierge-Variante: Anfragen werden von Hand an einen passenden Partner (Prüfdienst/Mieterverein) vermittelt, Antwort in 2 Werktagen.
 */
const COPY: Record<string, { h1: string; was: string; partner: string; selbst: { label: string; href: string } }> = {
  nebenkosten: {
    h1: "Nebenkostenabrechnung prüfen lassen",
    was: "Ob Hausmeister, Verwaltung oder Verteilerschlüssel zu Recht so abgerechnet wurden, kann nur jemand beurteilen, der Belege einsehen und bewerten darf.",
    partner: "einen registrierten Prüfdienst oder den Mieterverein",
    selbst: { label: "Lieber selbst Einwendungen schicken? Abrechnung fotografieren", href: "/a/nebenkosten" },
  },
  steuer: {
    h1: "Steuerbescheid prüfen lassen",
    was: "Ob das Finanzamt richtig gerechnet hat und welche Posten sich anfechten lassen, kann nur jemand beurteilen, der Steuerberatung leisten darf.",
    partner: "einen Steuerberater oder Lohnsteuerhilfeverein",
    selbst: { label: "Lieber selbst Einspruch einlegen? Bescheid fotografieren", href: "/a/steuer" },
  },
};
const FALLBACK = {
  h1: "Schreiben prüfen lassen",
  was: "Ob ein Bescheid inhaltlich richtig ist, kann nur jemand beurteilen, der rechtlich beraten darf.",
  partner: "eine zugelassene Beratungsstelle oder Kanzlei",
  selbst: { label: "Lieber selbst antworten? Schreiben fotografieren", href: "/" },
};

export default async function PruefenLassen({ searchParams }: { searchParams: Promise<{ anlass?: string }> }) {
  const { anlass: raw } = await searchParams;
  const anlass = raw && COPY[raw] ? raw : "nebenkosten";
  const c = COPY[anlass] ?? FALLBACK;
  return (
    <main className="screen">
      <TrackOnce name="check_view" props={{ anlass }} />
      <div className="screen-head">
        <Logo />
      </div>
      <div className="stack" style={{ gap: 10, paddingTop: 16 }}>
        <span className="eyebrow">Unverbindlich · Antwort in 2 Werktagen</span>
        <h1 style={{ fontSize: 26 }}>{c.h1}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.55 }}>
          Flinkbrief prüft Ihr Schreiben auf Form, Frist und Vollständigkeit – <strong>keine inhaltliche Bewertung</strong>. {c.was}
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.55 }}>
          Wir vermitteln Sie an {c.partner} in Ihrer Region und melden uns innerhalb von zwei Werktagen mit Name, Preis und Ablauf. Sie entscheiden dann.
        </p>
      </div>

      <ol className="steps" style={{ marginTop: 18 }}>
        <li>
          <strong>E-Mail hinterlassen</strong>
          <span>Kostenlos. Keine Unterlagen nötig.</span>
        </li>
        <li>
          <strong>Wir melden uns</strong>
          <span>Innerhalb von zwei Werktagen: Partner in Ihrer Region, Preis und Ablauf.</span>
        </li>
        <li>
          <strong>Sie entscheiden</strong>
          <span>Unterlagen gehen erst mit Ihrer Zustimmung an den Partner.</span>
        </li>
      </ol>

      <div style={{ paddingTop: 20 }}>
        <InterestForm anlass={anlass} />
      </div>

      <p className="muted" style={{ fontSize: 13, marginTop: 22, textAlign: "center" }}>
        <Link href={c.selbst.href} className="quiet">
          {c.selbst.label} →
        </Link>
      </p>
      <Footer />
    </main>
  );
}
