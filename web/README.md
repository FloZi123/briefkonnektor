# Flinkbrief – Web-App (www.flinkbrief.de)

Privatkunden-Flow: Bescheid fotografieren → verstehen → Angaben prüfen → Entwurf → Unterschrift → Versandart & Zahlung → Bestätigung/Status. Nutzt das Backend aus `../src` (DIN-5008-Renderer, Pingen-Adapter, Preise).

## Lokal

```bash
cd web
cp .env.example .env.local     # ANTHROPIC_API_KEY für Erkennung/Entwurf; STRIPE_* für echte Zahlung
npm install
npm run dev                    # http://localhost:3000
```

Ohne `STRIPE_SECRET_KEY` wird die Zahlung simuliert (Bestellung sofort „bezahlt“, Mock-Versand). Ohne `ANTHROPIC_API_KEY` antworten `/api/extract` und `/api/draft` mit 503; der Flow lässt sich mit manuell eingegebenem Text durchspielen. Ohne `SUPABASE_*` bleiben Bestellungen im Speicher, ohne `SMTP_PASS` werden Mails nur geloggt.

Preise kommen aus `NEXT_PUBLIC_PRICE_{POST,REGISTERED,DOWNLOAD}_CENTS` (brutto, Cent; aktuell 499/999/99) – Änderung in Vercel braucht einen neuen Build.

## Seiten

| Route | Zweck |
|---|---|
| `/` | Start: Foto/Upload, Demo-Bescheid, Briefarten (3 Gruppen inkl. Steuerbescheid), Ratgeber, Preise |
| `/brief/verstehen` | Nach dem Foto: Inhalt in einfacher Sprache, Forderung, Frist (Widerspruch 1 Monat, Einspruch Bußgeld 2 Wochen, Steuer 1 Monat + 4 Tage), Briefart wählen |
| `/brief/daten` | erkannte/eingegebene Daten, Adressvervollständigung, Fristbox |
| `/brief/entwurf` | KI-Entwurf, editierbar, Diktat, Lücken-Assistent, Prüfliste |
| `/brief/unterschrift` | Touch-Unterschrift (Canvas → PNG) |
| `/brief/versand` | Versandart (Post 4,99 / Einschreiben 9,99 / PDF 0,99), E-Mail, Stripe Checkout |
| `/brief/fertig?order=…&t=…` | Bestätigung mit Live-Status, PDF-Download (Token) |
| `/status` | Status-Abfrage ohne Konto (Bestellnummer + E-Mail) |
| `/fristrechner` | Fristrechner (Bekanntgabe +4 Tage, Monatsfrist, Wochenende/Feiertage; `lib/frist.ts`, Test `test/frist.ts`), aus jeder Fristbox verlinkt |
| `/ratgeber`, `/ratgeber/[slug]` | 8 SEO-Ratgeber aus `lib/guides.ts` (FAQ/Article-JSON-LD, OG-Bild) |
| `/a/[slug]` | Anzeigen-Landingpages (gleicher Inhalt wie Ratgeber, `noindex`, Canonical auf Ratgeber); speichern die Kampagne 30 Tage in `localStorage` → landet als `draft.attribution` an der Bestellung |
| `/impressum`, `/agb`, `/widerruf`, `/datenschutz` | Rechtstexte (einzige Stellen mit Postanschrift) |

Flow- und Status-Seiten sind `noindex`; `sitemap.ts`/`robots.ts` liefern Start, Ratgeber und Rechtstexte.

## API

| Route | Zweck |
|---|---|
| `POST /api/extract` | Foto/PDF → Felder + Verständnis (Claude Vision; Bild wird nicht gespeichert) |
| `POST /api/draft` | Angaben → Brieftext; mit `instruction` Überarbeitung |
| `POST /api/review` | Prüfliste + Ausfüllhilfe für Platzhalter (nie blockierend) |
| `GET /api/address?q=` / `?zip=` | Adressvervollständigung (Nominatim) / Ort zur PLZ (OpenPLZ) |
| `POST /api/letters/preview` | Vorschau-PDF aus dem Entwurf |
| `POST /api/checkout` | rendert PDF, legt Bestellung an (inkl. `attribution`), startet Stripe Checkout |
| `POST /api/webhooks/stripe` | `checkout.session.completed` → Versand (Pingen) bzw. Download freischalten, Bestätigungsmail |
| `POST /api/webhooks/pingen` | Status `sent` / `undeliverable` / `issues` (HMAC-Signatur), Statusmail |
| `GET /api/letters/[id]/pdf?t=` | PDF-Download nach Zahlung |
| `GET /api/letters/[id]/status?t=` | Live-Status für die Bestätigungsseite (bei `pending` wird Stripe befragt) |
| `POST /api/orders/lookup` | Bestellnummer + E-Mail → Status-Link mit Token |
| `GET /api/cron/cleanup` | täglich 03:17 UTC: Bestellungen > 30 Tage samt PDF löschen |
| `GET /api/cron/sync` | stündlich (:23): Sicherheitsnetz – hängende `pending` bei Stripe, `queued`/`sent` bei Pingen nachsehen |
| `POST /api/admin/retry` `{id}` | Versand einer bezahlten, aber fehlgeschlagenen Bestellung erneut anstoßen |
| `POST /api/admin/pingen-webhooks` | einmalig Webhooks bei Pingen registrieren |

Cron- und Admin-Routen erwarten `Authorization: Bearer <CRON_SECRET>`.

## Betrieb

**Vercel**: Projekt `flinkbrief`, Root Directory `web`, Region fra1, Crons in `vercel.json`. Domain `www.flinkbrief.de`; `proxy.ts` leitet in Production jede andere Host-Variante (flinkbrief.de, flinkbrief.com, *.vercel.app) per 308 um, `/api/*` ausgenommen. **Git-Push löst derzeit keinen Build aus** (GitHub-Webhook) – Deploy manuell über Vercel (Dashboard „Redeploy“ bzw. Deployment aus Commit anlegen).

**Analytics**: Vercel Web Analytics (cookielos, `@vercel/analytics`). Kampagnen-Erfolg über Seitenaufrufe von `/a/<kampagne>` und `attribution` in `orders.draft` (Supabase) – kein Google-Tag, kein Cookie-Banner nötig.

**Mail**: All-Inkl-SMTP `info@flinkbrief.de` (`lib/mail.ts`: Bestätigung, versendet, Problem). SPF gesetzt, DMARC `p=none`; **DKIM in KAS noch zu aktivieren** (Mails landen sonst teils im Spam). Autoresponder-Vorlage in `mail/autoresponder-info.html`.

**Supabase**: `supabase/migrations/0001_orders.sql` (Tabelle `orders`, privater Bucket `letters`). Zugriff nur serverseitig über den Service-Role-Key; RLS aktiv ohne Policies.

**Stripe**: Live-Keys in Vercel, Webhook auf `https://www.flinkbrief.de/api/webhooks/stripe`, Event `checkout.session.completed`. Bleibt der Webhook aus, schließt `/api/cron/sync` die Bestellung spätestens nach einer Stunde ab.

**Pingen**: `PINGEN_ENV=production`, Kosten ≈ 1,04 € je Brief. Einschreiben als `delivery_product` Einwurf-Einschreiben (`lib/letter.ts`).

**Google Ads**: Konto 225-435-5582, Kampagne „Flinkbrief Test Okt 2026 – Suche“ (Entwurf; Zahlungsmittel + Identitätsprüfung ausstehend). Landingpages `/a/steuer`, `/a/nebenkosten`; Erfolgskennzahl Kosten je Bestellung (CPO) aus Ads-Ausgaben ÷ Bestellungen mit `attribution`.

## Struktur

```
app/            Seiten + API-Routen (siehe oben), sitemap.ts, robots.ts, opengraph-image.tsx
components/     ui (ScreenHead/Stepbar, Fristbox), uploader, address, dictate, fills, signature,
                live-status, resume, guide (Ratgeber-Artikel), attribution, legal, progress
lib/ai.ts       Extraktions- und Entwurfs-Prompts (Briefarten inkl. steuer, AdV § 361 AO)
lib/types.ts    Draft, LetterKind, PRICES (aus NEXT_PUBLIC_PRICE_*)
lib/dates.ts    Fristen (widerspruchsfrist, einspruchsfrist, steuerfrist)
lib/guides.ts   Ratgeber-Inhalte + CAMPAIGNS (Landingpage-Slug → Ratgeber)
lib/store.ts    Entwurf in localStorage (24 h) + Kampagnen-Attribution (30 d)
lib/orders.ts   Bestellungen (Supabase / In-Memory), listOpenOrders für den Sync
lib/finalize.ts Abschluss nach Zahlung: Versand bzw. Download, Mail
lib/letter.ts   Brief-Rendering/Übergabe an ../src (Renderer, Pingen)
lib/mail.ts     SMTP-Versand + Mailvorlagen
lib/og.tsx      OG-Bilder 1200×630
proxy.ts        Host-Redirect auf www.flinkbrief.de
```

## Offen

- DKIM für info@flinkbrief.de aktivieren (KAS), danach DMARC auf `quarantine`
- Vercel-Git-Integration reparieren (Auto-Deploy bei Push)
- Google-Ads-Konto freischalten, Kampagne prüfen (Standort Deutschland, AI Max aus), Nebenkosten-Anzeigengruppe + Negativ-Keywords ergänzen
- Fristerinnerung (Cron: Bestellungen mit `deadline`, Mail 3 Tage vorher)
- Impressum auf GmbH umziehen (später)
- Partnerkanzlei-Weiterleitung (zurückgestellt)
