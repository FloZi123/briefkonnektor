import { PingenCarrier } from "../src/carriers/pingen";
import type { Letter } from "../src/types";

/** Adapter-Test mit gefaketem fetch: prüft Endpunkte, Header und Body-Struktur gegen das offizielle SDK. */
const calls: Array<{ url: string; method: string; headers: Record<string, string>; body?: string }> = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input);
  const headers = Object.fromEntries(new Headers(init?.headers as HeadersInit).entries());
  const body = typeof init?.body === "string" ? init.body : undefined;
  calls.push({ url, method: init?.method ?? "GET", headers, body });
  const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  if (url.endsWith("/auth/access-tokens")) return json({ access_token: "tok", expires_in: 3600 });
  if (url.endsWith("/file-upload")) return json({ data: { attributes: { url: "https://upload.test/x", url_signature: "sig", expires_at: "2099-01-01T00:00:00Z" } } });
  if (url === "https://upload.test/x") return new Response(null, { status: 200 });
  if (url.endsWith("/deliveries/letters/")) return json({ data: { id: "ltr_pingen_1", type: "letters", attributes: { status: "valid" } } });
  if (url.endsWith("/price-calculator")) return json({ data: { type: "letter_price_calculator", attributes: { currency: "EUR", price: 0.91 } } });
  if (url.endsWith("/deliveries/letters/ltr_pingen_1")) return json({ data: { id: "ltr_pingen_1", type: "letters", attributes: { status: "sent" } } });
  if (url.endsWith("/cancel")) return new Response(null, { status: 204 });
  return json({ error: "unexpected " + url }, 500);
}) as typeof fetch;

const c = new PingenCarrier({ clientId: "id", clientSecret: "sec", organisationId: "org1", env: "staging", webhookSigningKey: "whsec" });
const letter = { id: "ltr_test", customer: "k", pdf: new Uint8Array([37, 80, 68, 70]), recipient: { country: "DE" }, sender: {} } as unknown as Letter;

const sent = await c.send(letter, { color: false, duplex: true });
if (sent.carrierRef !== "ltr_pingen_1") throw new Error("carrierRef");
const created = calls.find((x) => x.url.endsWith("/deliveries/letters/") && x.method === "POST")!;
const body = JSON.parse(created.body!);
if (created.url !== "https://api-staging.pingen.com/organisations/org1/deliveries/letters/") throw new Error("letters path: " + created.url);
if (body.data.type !== "letters" || body.data.attributes.print_mode !== "duplex" || body.data.attributes.auto_send !== true) throw new Error("letters body");
if (created.headers["content-type"] !== "application/vnd.api+json") throw new Error("content-type");
if (!calls[0].url.endsWith("/auth/access-tokens")) throw new Error("token endpoint");
if (calls.find((x) => x.url === "https://upload.test/x")?.method !== "PUT") throw new Error("upload PUT");
console.log("✓ send: token → file-upload → PUT → POST deliveries/letters/");

const q = await c.quote("DE", { color: false, duplex: false });
if (q !== 0.91) throw new Error("quote");
console.log("✓ quote: price-calculator →", q, "€");

const st = await c.status("ltr_pingen_1");
if (st.status !== "sent") throw new Error("status");
console.log("✓ status:", st.carrierStatus, "→", st.status);

await c.cancel("ltr_pingen_1");
console.log("✓ cancel: POST …/cancel");

const { createHmac } = await import("node:crypto");
const raw = JSON.stringify({ data: { id: "evt1", relationships: { letter: { data: { id: "ltr_pingen_1" } } } } });
const sig = createHmac("sha256", "whsec").update(raw).digest("hex");
if (!c.verifyWebhook(raw, sig) || c.verifyWebhook(raw, "deadbeef")) throw new Error("webhook signature");
console.log("✓ webhook: HMAC-SHA256-Signatur geprüft");

console.log("\nPingen-Adapter-Test bestanden.");
