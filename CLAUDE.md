# Briefkonnektor / Flinkbrief – Arbeitsregeln für Claude Code

## Zwei Produkte, ein Repo
| Pfad | Produkt | Status |
|---|---|---|
| `src/`, `api/`, `test/` | **Briefkonnektor** – MCP-Server (B2B, KI-neutral: Claude, ChatGPT, Gemini) | Grundgerüst, OAuth/DCR und Lettershop-Adapter offen |
| `web/` | **Flinkbrief** – Next.js-App für Privatkunden (www.flinkbrief.de) | **LIVE** – echte Stripe-Zahlungen, echter Pingen-Versand |

Pro Auftrag nur eines anfassen. Design-Aufträge betreffen fast immer `web/`.
Doku: `README.md` (Konnektor), `web/README.md` (Flinkbrief), `design/design-system/` (Tokens, Komponenten, Logos).

## UNANTASTBAR ohne ausdrücklichen Auftrag von Florian
- `web/app/api/**` – Checkout, Webhooks, Pingen, Cron, Admin
- `web/lib/orders.ts`, `finalize.ts`, `store.ts`, `letter.ts`, `mail.ts`, `legal.ts`
- `web/supabase/**` – Schema und Migrationen
- `src/**` – Renderer und Carrier-Adapter (werden von `web/` mitbenutzt)
- Rechtstexte: `web/app/agb`, `datenschutz`, `impressum`, `widerruf`
- Preise: Post 4,99 € · Einschreiben 9,99 € · PDF 0,99 € – keine Änderung, kein Preistest
- Betreiberanschrift nur in Impressum/AGB/Widerruf/Datenschutz – nie in Ratgeber, Startseite oder Mails

Design-Skills ändern: `web/app/**/page.tsx` (Layout/Copy), `web/components/**`, `web/app/globals.css`, `web/public/**`.

## Design-Quellen (Reihenfolge der Wahrheit)
1. `web/app/globals.css` `:root` – die Tokens sind abgenommen, nichts Neues erfinden
2. `design/design-system/tokens.json` + `design-system.json`
3. `DESIGN.md` (sobald per `/impeccable document` erzeugt)

Idee: Der Brief ist das Objekt – weiße „Blätter“ auf Papiergrau, Marker-Gelb als einziger Schmuck.
Farben: Ink #0f1b3d, Flink-Blau #2f5bea, Marker #fff1a8, Zugestellt-Grün, Frist-Orange, Fehler-Rot.
Schriften: Bricolage Grotesque (Display), IBM Plex Sans (Text), JetBrains Mono (Zahlen). Light + Dark vorhanden, beide pflegen.
Sprache: Deutsch, klar, keine Behördensprache. Nie „KI“/„Claude“ als Verkaufsargument in Flinkbrief-Copy.

## Workflow für Design-Arbeit an `web/`
0. **Immer auf Branch** (`design/<thema>`), nie auf `main` – Vercel deployt `main` automatisch live.
1. **Seite verbessern** → `design-taste-frontend`: auditiert erst im Browser (`npm run web` → localhost:3000), dann ändern. Tokens beibehalten.
2. **Neue Sektion/Seite** → ebenfalls `design-taste-frontend`, Brief = diese Datei + Design-System.
3. **Motion** → Emil: `find-animation-opportunities` → `animate` → `review-animations`. Impeccables `animate` nicht verwenden.
4. **Härten** → `break-ui` (lange Namen, 10-seitiger Bescheid, leere Felder, Umlaute in Adressen), `mobile-native`, `/impeccable harden`.
5. **Funktion prüfen (Playwright MCP)** – im Browser, nicht Florian fragen:
   - Startseite 390/820/1440 px, Dark Mode
   - `/brief/verstehen → daten → entwurf → unterschrift → versand`: jeden Schritt mit leeren Pflichtfeldern → muss blockieren
   - Unterschrift per Maus/Touch zeichnen → Weiter aktiv?
   - **STOPP vor der Stripe-Seite.** Nie einen Kauf abschließen, nie `/api/checkout` oder `/api/webhooks` manuell aufrufen – jeder Abschluss druckt und versendet einen echten Brief.
6. **Audit** → `/impeccable audit`, dann `/impeccable polish`.
7. **Preview-Deploy anschauen**, dann erst Merge-Vorschlag an Florian.

`/impeccable craft` und `design-taste-frontend` nie auf dieselbe Seite anwenden.

## Reihenfolge der Seiten
1. `web/app/page.tsx` (Startseite) und `web/app/ratgeber/**` – hier läuft als Nächstes ein Google-Ads-Test
2. `web/app/a/[slug]` (Anlass-Seiten)
3. `web/app/brief/**` (Bestellflow) – zuletzt, kleinste Schritte, Playwright-Durchlauf Pflicht

## Verbote
- Keine neuen Farben, Schriften, Radien, Schatten – nur Tokens aus `globals.css`
- Keine Farbverläufe, Glows, Karten in Karten, Bounce-Easings
- Keine Stock-/Archivfotos in Flinkbrief: das Produkt ist das Blatt Papier, keine Menschen-am-Laptop-Bilder
- Keine erfundenen Zahlen (Zustellzeiten, Preise, Fristen) – aus `web/lib/` bzw. Doku
- Keine Rechtsberatung in Copy: Prüfung ist formal (Form, Frist, Rechtsbehelf), keine Einzelfallbewertung

## Definition of Done
- `npm run web:build` fehlerfrei, `npm test` (Konnektor) weiterhin grün
- 390 / 820 / 1440 px, Light + Dark, kein horizontaler Scroll
- Playwright-Durchlauf Schritt 5 ohne Befund
- `npx impeccable detect web/app` ohne Primärbefunde
- Branch + Preview-URL, kein Merge ohne Florian

## Konnektor-Arbeit (`src/`, `api/`)
Keine Design-Skills. Testen mit `npm test` (Mock-Carrier) und `npm run pingen:check`. Nüchtern, Tabellen, Code.
