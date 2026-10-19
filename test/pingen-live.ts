/**
 * Live-Check gegen die Pingen-API (Staging oder Production) – schreibt nichts, versendet nichts.
 * Ablauf: Token holen → Organisationen auflisten → Preisrechner → Upload-URL anfordern.
 *
 *   set -a; source .env; set +a
 *   npm run build && node dist/test/pingen-live.js
 */
const env = process.env.PINGEN_ENV === "production" ? "production" : "staging";
const hosts = {
  staging: { api: "https://api-staging.pingen.com", identity: "https://identity-staging.pingen.com" },
  production: { api: "https://api.pingen.com", identity: "https://identity.pingen.com" },
}[env];

const id = process.env.PINGEN_CLIENT_ID;
const secret = process.env.PINGEN_CLIENT_SECRET;
if (!id || !secret) {
  console.error("PINGEN_CLIENT_ID / PINGEN_CLIENT_SECRET fehlen (set -a; source .env; set +a)");
  process.exit(1);
}

const mask = (s: string) => s.slice(0, 4) + "…" + s.slice(-3);
console.log(`Umgebung: ${env}  Client-ID: ${mask(id)}`);

// 1. Token
const body = new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret });
if (process.env.PINGEN_SCOPE) body.set("scope", process.env.PINGEN_SCOPE);
const tokRes = await fetch(`${hosts.identity}/auth/access-tokens`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
  body,
});
if (!tokRes.ok) {
  console.error(`✗ Token: HTTP ${tokRes.status}`, await tokRes.text());
  console.error("  → Client-ID/Secret prüfen (Tippfehler? Secret enthält + und /, exakt übernehmen)");
  process.exit(1);
}
const tok = (await tokRes.json()) as { access_token: string; expires_in: number };
console.log(`✓ Token erhalten (gültig ${Math.round(tok.expires_in / 60)} min)`);

const api = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${hosts.api}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${tok.access_token}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : null };
};

// 2. Organisationen
const orgs = await api("/organisations");
if (orgs.status !== 200) {
  console.error(`✗ /organisations: HTTP ${orgs.status}`, JSON.stringify(orgs.json).slice(0, 300));
  process.exit(1);
}
const orgList = (orgs.json.data as Array<{ id: string; attributes: { name: string; status?: string } }>) ?? [];
console.log(`✓ Organisationen (${orgList.length}):`);
for (const o of orgList) console.log(`   ${o.id}  ${o.attributes.name}${o.attributes.status ? ` [${o.attributes.status}]` : ""}`);
const org = process.env.PINGEN_ORGANISATION_ID || orgList[0]?.id;
if (!org) {
  console.error("✗ Keine Organisation – erst im Pingen-Konto anlegen");
  process.exit(1);
}
if (!process.env.PINGEN_ORGANISATION_ID) console.log(`   → PINGEN_ORGANISATION_ID=${org} in die .env eintragen`);

// 3. Preisrechner
const price = await api(`/organisations/${org}/deliveries/letters/price-calculator`, {
  method: "POST",
  body: JSON.stringify({
    data: {
      type: "letter_price_calculator",
      attributes: { country: "DE", delivery_product: "cheap", print_mode: "simplex", print_spectrum: "grayscale", paper_types: ["normal"] },
    },
  }),
});
if (price.status === 200 || price.status === 201) {
  const a = price.json.data.attributes;
  console.log(`✓ Preisrechner DE/cheap/simplex/grayscale: ${a.price} ${a.currency}`);
} else {
  console.log(`✗ Preisrechner: HTTP ${price.status}`, JSON.stringify(price.json).slice(0, 400));
}

// 4. Upload-URL (nur anfordern, kein Upload)
const up = await api("/file-upload");
if (up.status === 200) {
  console.log(`✓ Upload-URL erhalten, gültig bis ${up.json.data.attributes.expires_at}`);
} else {
  console.log(`✗ /file-upload: HTTP ${up.status}`, JSON.stringify(up.json).slice(0, 300));
}

// 5. Vorhandene Briefe (erste Seite)
const letters = await api(`/organisations/${org}/deliveries/letters/?page[limit]=5`);
if (letters.status === 200) {
  const n = (letters.json.data as unknown[]).length;
  console.log(`✓ Briefe in der Organisation (max. 5 gezeigt): ${n}`);
  for (const l of letters.json.data as Array<{ id: string; attributes: { status: string; file_original_name: string } }>) {
    console.log(`   ${l.id}  ${l.attributes.status}  ${l.attributes.file_original_name}`);
  }
} else {
  console.log(`✗ Briefliste: HTTP ${letters.status}`);
}

console.log("\nLive-Check abgeschlossen – nichts angelegt, nichts versendet.");
