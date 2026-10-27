# Trichter-Auswertung (Anzeigen → Kauf)

Datenquellen, ohne Google-Tag und ohne Cookies:

| Schritt | Quelle | Abfrage |
|---|---|---|
| Klicks je Anzeigengruppe, Kosten | Google Ads → Kampagne → Anzeigengruppen | manuell / Browser |
| Landingpage-Besucher | Vercel Web Analytics, `requestPath` = `/a/<kampagne>` | `aggregate_pageviews by requestPath` |
| Foto gelesen | `/brief/verstehen` (nur nach erfolgreicher Erkennung erreichbar) | dito |
| Angaben / Entwurf / Unterschrift / Versand | `/brief/daten`, `/brief/entwurf`, `/brief/unterschrift`, `/brief/versand` | dito |
| Bezahlt | Supabase `orders` mit `status in ('paid','queued','sent','delivered')` und `draft->>'attribution'` | SQL unten |

Kosten je Bestellung (CPO) = Ads-Kosten der Gruppe ÷ bezahlte Bestellungen mit passender `attribution` im selben Zeitraum.

```sql
-- bezahlte Bestellungen je Kampagne und Tag
select date_trunc('day', created_at) as tag,
       coalesce(draft->>'attribution', 'organisch') as kampagne,
       count(*) as bestellungen,
       sum(price_cents) / 100.0 as umsatz_eur
from orders
where status in ('paid','queued','sent','delivered')
  and created_at >= '2026-10-26'
group by 1, 2
order by 1, 2;
```

Vercel-Abfrage (MCP `aggregate_pageviews`): `since`/`until` als ISO-Zeit, `by: ["requestPath"]`, `limit: 30`.
Für Tagesverläufe `by: ["day", "requestPath"]`.

## Ereignisse (Vercel Web Analytics, cookielos)

Seitenaufrufe zählt Vercel selbst; Ereignisse nur dort, wo jemand handelt. Gesendet über `track()` aus `web/lib/track.ts`
(wrappt `@vercel/analytics`, schluckt Fehler, legt die Warteschlange an, falls ein Ereignis vor `<Analytics />` kommt).
`campaign` wird an jedes Ereignis gehängt, wenn die Einstiegsseite eine Kampagne gesetzt hat (`getAttribution()`, 30 Tage).
Nie in Properties: E-Mail, Name, Adresse, Aktenzeichen, Betrag, Freitext.

| Ereignis | Wo | Wann | Properties |
|---|---|---|---|
| `landing_view` | `components/attribution.tsx` | Aufruf einer Anzeigen-Seite `/a/<kampagne>`, einmal je Aufruf | `campaign` |
| `upload_started` | `components/uploader.tsx` | Datei gewählt und Formatprüfung bestanden (falsches Format → kein Ereignis) | `source`: `camera` \| `picker` (Ziehen/Ablegen zählt als `picker`) |
| `extract_ok` | `components/uploader.tsx` | Erkennung erfolgreich | `kind`, `confidence` (`high`\|`medium`\|`low`\|`unbekannt`) |
| `extract_failed` | `components/uploader.tsx` | Erkennung fehlgeschlagen, genau eins je Upload | `status`: `413` \| `415` \| `422` \| `500` (alle anderen Fehler inkl. Netzwerk → `500`) |
| `kind_chosen` | `app/brief/verstehen` | Briefart nach dem Foto gewählt | `kind`, `suggested` (`true`, wenn aus den Vorschlägen) |
| `draft_ready` | `app/brief/entwurf` | Erster Entwurf erzeugt (nicht bei Anpassungen) | `kind` |
| `draft_edited` | `app/brief/entwurf` | Erste Änderung am Text, einmal je Aufruf der Seite | `kind` |
| `draft_instruction` | `app/brief/entwurf` | Anpassungs-Chip geklickt (freier Wunsch zählt nicht) | `chip` (Beschriftung) |
| `signature_done` | `app/brief/unterschrift` | „Vorschau & Versandart“ mit Unterschrift | – |
| `signature_skipped` | `app/brief/unterschrift` | „Ohne Unterschrift weiter“ oder „Vorschau & Versandart“ ohne Unterschrift | – |
| `preview_opened` | `app/brief/versand` | „PDF-Vorschau ansehen“ geklickt | – |
| `checkout_click` | `app/brief/versand` | „Jetzt bezahlen“ geklickt und Angaben vollständig | `shipping` |
| `order_paid` | `app/brief/fertig` | Bestätigungsseite mit bezahlter Bestellung, einmal je Laden der Seite | `shipping` |
| `frist_calculated` | `components/fristrechner.tsx` | Ergebnis steht 1 s unverändert (Tippen des Jahres erzeugt sonst Zwischenwerte); gleiche Eingabe zählt nicht doppelt | `art`, `zugang` |

Hinweis `order_paid`: ohne Browser-Speicher zählt ein erneutes Laden der Bestätigungsseite (z. B. aus der Mail) erneut.
Für Umsatz gilt deshalb weiter Supabase (`orders`), das Ereignis nur für den Trichter.

Auswertung im Vercel-Dashboard unter Analytics → Events; je Ereignis nach Property filtern (z. B. `campaign`).

Entscheidungsregel 11.11.2026: CPO < 6,85 € → Preis Post 9,99 € testen, Ads skalieren · 6,85–20 € → nur SEO/Foren, Ads pausieren · > 20 € oder 0 Bestellungen → Trichter prüfen, kein weiteres Budget.
