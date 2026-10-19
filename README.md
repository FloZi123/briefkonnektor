# Briefkonnektor – MCP-Server für den Briefversand

Claude schreibt den Brief, der Konnektor rendert ein DIN-5008-PDF und übergibt es an den Carrier (Druck, Kuvertierung, Porto). Remote-MCP-Server über Streamable HTTP, lauffähig lokal und als Vercel-Function.

## Tools

| Tool | Zweck |
|---|---|
| `create_letter` | Entwurf anlegen, PDF rendern, Preisschätzung – kein Versand |
| `preview_letter` | PDF als eingebettete Ressource zurückgeben (zum Zeigen im Chat) |
| `send_letter` | Versand an Carrier, nur mit `confirm=true` |
| `get_status` | Status (draft → queued → sent → delivered / failed), frisch vom Carrier |
| `list_letters` | Letzte Briefe des Kunden |
| `estimate_campaign` | Versandklasse + Preis für Serien-/Werbebriefe (Einzelbrief / Dialogpost Easy ab 500 / Dialogpost ab 5.000) |

Mandantentrennung: jedes Bearer-Token gehört zu einem Kunden; Briefe sind nur für den eigenen Kunden sichtbar.

## Lokal starten

```bash
cp .env.example .env        # Token und Carrier eintragen
npm install
npm test                    # Build + End-to-End-Test gegen Mock-Carrier, schreibt test-output.pdf
set -a; source .env; set +a
npm start                   # http://localhost:3000/mcp
```

Zum Testen aus Claude heraus braucht der Server eine öffentliche HTTPS-URL (z. B. `vercel dev` + Tunnel oder direkt deployen).

## Deploy auf Vercel

```bash
npm i -g vercel
vercel link
vercel env add API_KEYS           # z. B. "a1b2c3…:rolling-space,d4e5f6…:kunde2"
vercel env add CARRIER            # mock | pingen
vercel env add PINGEN_CLIENT_ID   # nur bei CARRIER=pingen
vercel env add PINGEN_CLIENT_SECRET
vercel env add PINGEN_ORGANISATION_ID
vercel env add PINGEN_ENV         # staging | production
vercel --prod
```

Endpunkte: `https://<projekt>.vercel.app/mcp` und `/health`.

## In Claude einbinden

Settings → Connectors → „+“ → **Add custom connector** → Name + URL `https://<projekt>.vercel.app/mcp`.

Aktuell nutzt der Server Bearer-Token-Auth. Der Connector-Dialog von Claude erwartet entweder einen authless Server oder OAuth 2.1 mit Dynamic Client Registration – das ist der nächste Baustein (siehe unten). Für erste Tests: Token in den Advanced Settings des Connectors hinterlegen, sofern der Plan das anbietet, oder den MCP Inspector nutzen:

```bash
npx @modelcontextprotocol/inspector
# Transport: Streamable HTTP, URL: http://localhost:3000/mcp, Header: Authorization: Bearer <token>
```

## Carrier

| Carrier | Env | Status |
|---|---|---|
| `mock` | – | Simulation, Status wandert queued → sent → delivered nach 10 s / 30 s |
| `pingen` | `PINGEN_*` | Pingen API v2: Client-Credentials → Upload-URL → PUT PDF → Brief mit `auto_send` → Statusabfrage. `PINGEN_ENV=staging` = Testumgebung ohne echten Versand |
| `lettershop` | – | **TODO** – Dialogpost-Kampagnen ab 500 Stück über Lettershop-Partner (REST-API nach Angebot) |

Neuen Carrier anlegen: `src/carriers/<name>.ts` implementiert das `Carrier`-Interface aus `src/types.ts`, Registrierung in `src/carriers/index.ts`.

## Struktur

```
src/
  app.ts            Express-App, /mcp (Streamable HTTP, stateless), Bearer-Auth
  server.ts         lokaler Start
  mcp.ts            Tool-Definitionen (McpServer, pro Request mit Kundenkontext)
  types.ts          Zod-Schemas (Adresse, Absender), Letter, Carrier-Interface
  store.ts          In-Memory-Ablage (→ Supabase)
  pricing.ts        Versandklassen + Preise
  letter/render.ts  DIN-5008-Form-B-PDF mit pdf-lib
  carriers/         mock.ts, pingen.ts, index.ts
api/mcp.ts          Vercel-Function
test/client.ts      End-to-End-Test mit echtem MCP-Client
```

## Nächste Schritte

1. **OAuth 2.1 + DCR** vor `/mcp` (Supabase Auth oder Auth0/Clerk/WorkOS) – Voraussetzung für den „Add custom connector“-Flow in Claude ohne manuelles Token.
2. **Supabase statt MemoryStore**: Tabelle `letters`, PDFs in Storage, Webhook-Endpunkt für Pingen-Statusupdates.
3. **Stripe Credits**: Guthaben je Kunde, Abbuchung in `send_letter`, Ablehnung bei 0.
4. **Lettershop-Adapter** für Dialogpost-Kampagnen, sobald das Angebot/die API-Doku da ist; `estimate_campaign` liefert bereits die Klassenlogik.
5. **Inhaltscheck „werblich?“** vor dem Routing in die Dialogpost-Klasse (Prompt-Tool oder eigener Classifier).
6. **Dashboard** (Vercel/Next.js) auf derselben Supabase-Tabelle.
