# Flinkbrief – Web-App

Privatkunden-Flow: Bescheid fotografieren → Daten prüfen → Entwurf → Unterschrift → Versandart & Zahlung → Bestätigung. Nutzt das Backend aus `../src` (DIN-5008-Renderer, Pingen-Adapter, Preise).

## Lokal

```bash
cd web
cp .env.example .env.local     # ANTHROPIC_API_KEY für Erkennung/Entwurf; STRIPE_* für echte Zahlung
npm install
npm run dev                    # http://localhost:3000
```

Ohne `STRIPE_SECRET_KEY` wird die Zahlung simuliert (Bestellung sofort „bezahlt“, Mock-Versand) – praktisch für den Flow-Test. Ohne `ANTHROPIC_API_KEY` antworten `/api/extract` und `/api/draft` mit 503 und klarer Meldung; der Flow lässt sich dann mit manuell eingegebenem Text durchspielen.

## Routen

| Route | Zweck |
|---|---|
| `/` | Start: Kamera/Upload, Briefarten |
| `/brief/daten` | erkannte/eingegebene Daten, Fristbox |
| `/brief/entwurf` | KI-Entwurf, editierbar, Anpassungs-Chips |
| `/brief/unterschrift` | Touch-Unterschrift (Canvas → PNG) |
| `/brief/versand` | Versandart, E-Mail, Stripe Checkout |
| `/brief/fertig?order=…` | Bestätigung, Status-Timeline, PDF-Download (Token) |
| `POST /api/extract` | Foto/PDF → Felder (Claude Vision, Bild wird nicht gespeichert) |
| `POST /api/draft` | Angaben → Brieftext; mit `instruction` Überarbeitung |
| `POST /api/letters/preview` | Vorschau-PDF aus dem Entwurf |
| `POST /api/checkout` | rendert PDF, legt Bestellung an, startet Stripe Checkout |
| `POST /api/webhooks/stripe` | `checkout.session.completed` → Versand (Pingen) bzw. Download freischalten |
| `GET /api/letters/[id]/pdf?t=` | PDF-Download nach Zahlung |

## Vercel

Eigenes Projekt, Root Directory `web`, Framework Next.js. Env-Vars wie in `.env.example`; `NEXT_PUBLIC_BASE_URL` auf die Produktions-Domain. Stripe-Webhook auf `https://<domain>/api/webhooks/stripe`, Event `checkout.session.completed`.

## Supabase (Bestellungen + PDFs)

1. `supabase/migrations/0001_orders.sql` im SQL-Editor des Projekts ausführen (Tabelle `orders`, privater Bucket `letters`).
2. Env-Vars `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` setzen (Vercel + `.env.local`). Ohne die beiden bleibt `lib/orders.ts` im In-Memory-Modus.
3. Zugriff läuft nur serverseitig über den Service-Role-Key; RLS ist aktiv ohne Policies, der Browser sieht nichts.

Aufräumen: `delete from orders where expires_at < now()` + Objekte im Bucket – als Supabase-Cron (pg_cron) oder Vercel-Cron nachziehen.

## Offen vor Launch

- Cron für abgelaufene Bestellungen (30 Tage) inkl. Storage-Objekte
- Status-/Bestätigungs-Mails (Resend o. ä.)
- Einschreiben: Pingen-`delivery_product` für Einwurf-Einschreiben verifizieren (`lib/letter.ts`)
- Rechtstexte: AGB, Widerruf, Datenschutz, Impressum, AVV
- Fristerinnerung (Cron: Bestellungen mit `deadline`, Mail 3 Tage vorher)
