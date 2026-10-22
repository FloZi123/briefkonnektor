import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui";
import { Footer } from "@/components/legal";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Ratgeber: Bescheide verstehen und beantworten",
  description: "Fristen, Form und Ablauf bei Bußgeldbescheid, Jobcenter-Bescheid, Nebenkostenabrechnung, Mahnung und Rundfunkbeitrag – verständlich erklärt.",
};

export default function RatgeberIndex() {
  return (
    <main className="guide">
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
        <div className="guide-list">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/ratgeber/${g.slug}`} className="guide-card">
              <strong>{g.title}</strong>
              <span>{g.description}</span>
              <small>{g.deadlineShort}</small>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
