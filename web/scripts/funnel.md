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
       sum(amount_cents) / 100.0 as umsatz_eur
from orders
where status in ('paid','queued','sent','delivered')
  and created_at >= '2026-10-26'
group by 1, 2
order by 1, 2;
```

Vercel-Abfrage (MCP `aggregate_pageviews`): `since`/`until` als ISO-Zeit, `by: ["requestPath"]`, `limit: 30`.
Für Tagesverläufe `by: ["day", "requestPath"]`.

Entscheidungsregel 11.11.2026: CPO < 6,85 € → Preis Post 9,99 € testen, Ads skalieren · 6,85–20 € → nur SEO/Foren, Ads pausieren · > 20 € oder 0 Bestellungen → Trichter prüfen, kein weiteres Budget.
