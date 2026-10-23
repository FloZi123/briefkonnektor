# Product

<!-- impeccable:product-schema 1 -->

Gilt für **Flinkbrief** (`web/`, www.flinkbrief.de). Der Briefkonnektor (`src/`, `api/`) ist ein B2B-MCP-Server ohne eigene Oberfläche und bekommt keine Design-Arbeit.

## Platform

web

## Users

Privatpersonen in Deutschland, die Post von Behörde, Amt, Vermieter oder Gläubiger bekommen haben – Bußgeldbescheid, Steuerbescheid, Nebenkostenabrechnung, Mahnung – und darauf schriftlich reagieren müssen. Meist am Handy, oft unsicher, was der Brief bedeutet, und unter Fristdruck. Sie schreiben selten förmliche Briefe und wollen ohne Konto, ohne Drucker und ohne Gang zur Post fertig werden.

## Product Purpose

Flinkbrief macht aus einem fotografierten Schreiben eine fertige, unterschriebene und per Post versandte Antwort. Ablauf: Foto → Erklärung in einfacher Sprache mit Forderung und Frist → Angaben prüfen → Entwurf → Unterschrift mit dem Finger → Versand (Brief, Einwurf-Einschreiben oder PDF) → Status. Erfolg: Die Antwort ist fristgerecht unterwegs, ohne dass der Nutzer etwas abtippen oder ausdrucken musste.

## Positioning

Der Brief ist das Produkt: Flinkbrief liest das echte Schreiben, rechnet die Frist aus dem Bescheid aus und schickt einen echten, DIN-5008-gesetzten Brief über einen Druck- und Versanddienstleister (Pingen) – alles in einem Durchgang, ohne Konto. „Verstehen“ ist kostenlos, bezahlt wird erst der Versand.

## Operating Context

- Einstieg über Google-Suche und Google-Ads-Landingpages (`/a/[slug]`) sowie SEO-Ratgeber (`/ratgeber`).
- Nutzung überwiegend mobil, häufig direkt neben dem Papierbrief.
- Zahlung über Stripe Checkout; Versand produktiv über Pingen. Jeder abgeschlossene Kauf druckt und versendet einen echten Brief.
- Status ohne Konto über Bestellnummer + E-Mail (`/status`).

## Capabilities and Constraints

- Briefarten: Widerspruch, Einspruch, Steuer, Unterlagen nachreichen, Fristverlängerung, Nachfrage, Nebenkosten, Mängel, Mahnung, Beschwerde, frei (`web/lib/types.ts`).
- Fristen: Widerspruch 1 Monat, Einspruch Bußgeld 2 Wochen, Steuer 1 Monat + 4 Tage (`web/lib/dates.ts`).
- Preise fest: Brief per Post 4,99 €, Einwurf-Einschreiben 9,99 €, Nur PDF 0,99 €, jeweils inkl. MwSt. – keine Änderung, kein Preistest.
- Foto wird nach der Erkennung gelöscht, Brief und Bestellung nach 30 Tagen. Kein Konto, kein Newsletter, keine Cookies (Vercel Web Analytics).
- Keine Rechtsberatung: Prüfung nur formal (Form, Frist, Rechtsbehelf), keine Einzelfallbewertung.
- Betreiberanschrift nur in Impressum, AGB, Widerruf, Datenschutz.

## Brand Commitments

- Name: Flinkbrief. Logos in `web/public/` und `design/logos/`.
- Sprache: Deutsch, klar, Sie-Form, keine Behördensprache.
- „KI“ oder „Claude“ nie als Verkaufsargument in der Copy.
- Keine Stock- oder Archivfotos von Menschen; das Produkt wird über das Blatt Papier gezeigt.
- Visuelle Tokens sind abgenommen (`web/app/globals.css`, `design/design-system/`) – siehe DESIGN.md.

## Evidence on Hand

- Interaktive Demo: gerenderter Beispiel-Bescheid mit erkannten Feldern auf der Startseite.
- 8 Ratgeber-Artikel (`web/lib/guides.ts`).
- **Keine** Kundenstimmen, Bestellzahlen, Bewertungen, Presse oder Zustellstatistiken. Nichts davon erfinden.

## Product Principles

1. Erst verstehen, dann zahlen – der kostenlose Teil muss allein schon helfen.
2. Die Frist ist das Wichtigste auf jeder Seite, auf der sie bekannt ist.
3. Ehrlich über Grenzen: keine Rechtsberatung, Verantwortung für den Versand bleibt beim Nutzer.
4. Nichts abtippen, nichts drucken, kein Konto.
5. Datensparsam und sichtbar datensparsam.

## Accessibility & Inclusion

WCAG 2.2 AA (Kontrast mindestens 4,5:1 für Text, Tastaturbedienung, sichtbarer Fokus). Relevant auch wegen des Barrierefreiheitsstärkungsgesetzes für Verbraucher-Dienste. Nutzer sind oft gestresst und am Handy: große Tippflächen, kurze Sätze.
