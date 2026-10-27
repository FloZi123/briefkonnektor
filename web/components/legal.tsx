import Link from "next/link";
import { Logo } from "./ui";
import { LEGAL_UPDATED } from "@/lib/legal";

/** Fußzeile mit Rechtslinks – auf Start- und Bestätigungsseite sowie allen Rechtsseiten. */
export const Footer = () => (
  <footer className="footer">
    <Link href="/ratgeber">Ratgeber</Link>
    <Link href="/fristrechner">Fristrechner</Link>
    <Link href="/impressum">Impressum</Link>
    <Link href="/datenschutz">Datenschutz</Link>
    <Link href="/agb">AGB</Link>
    <Link href="/widerruf">Widerruf</Link>
  </footer>
);

/** Rahmen für Rechtstexte: lesbare Breite, Logo, Stand. */
export function LegalPage({ title, children, updated = LEGAL_UPDATED }: { title: string; children: React.ReactNode; updated?: string }) {
  return (
    <main className="screen legal" style={{ maxWidth: 720 }}>
      <div className="screen-head">
        <Link href="/" aria-label="Zur Startseite">
          <Logo />
        </Link>
      </div>
      <h1>{title}</h1>
      <p className="muted legal-stand">Stand: {updated}</p>
      {children}
      <Footer />
    </main>
  );
}
