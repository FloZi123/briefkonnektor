import { createHmac, timingSafeEqual } from "node:crypto";
import type { Carrier, Letter, LetterStatus, SendOptions, SendResult, StatusResult } from "../types.js";

/**
 * Pingen API v2 – Endpunkte verifiziert gegen das offizielle SDK
 * (github.com/pingencom/pingen2-sdk-php, Stand Okt 2026):
 *
 *   POST {identity}/auth/access-tokens                       client_credentials
 *   GET  {api}/file-upload                                   → url, url_signature, expires_at
 *   PUT  <url>  (Content-Type: application/pdf)              PDF-Upload
 *   POST {api}/organisations/{org}/deliveries/letters/        type "letters"
 *   GET  {api}/organisations/{org}/deliveries/letters/{id}
 *   POST {api}/organisations/{org}/deliveries/letters/{id}/send
 *   POST {api}/organisations/{org}/deliveries/letters/{id}/cancel
 *   POST {api}/organisations/{org}/deliveries/letters/price-calculator   type "letter_price_calculator"
 *   POST {api}/organisations/{org}/webhooks                   type "webhooks" {event_category,url,signing_key}
 *   Webhook-Eingang: Header "Signature" = HMAC-SHA256(rawBody, signing_key) hex
 *
 * delivery_product: "cheap" | "fast" | "electronic_email" | "electronic_ebill"
 * (Einschreiben-Produktcode noch gegen Preisrechner/Doku verifizieren)
 * Alle Requests/Responses sind JSON:API (application/vnd.api+json).
 */
export interface PingenConfig {
  clientId: string;
  clientSecret: string;
  organisationId: string;
  env: "staging" | "production";
  /** OAuth-Scopes, leer = Standard der Client-Credentials */
  scope?: string;
  /** Signing-Key des bei Pingen registrierten Webhooks */
  webhookSigningKey?: string;
}

const HOSTS = {
  staging: { api: "https://api-staging.pingen.com", identity: "https://identity-staging.pingen.com" },
  production: { api: "https://api.pingen.com", identity: "https://identity.pingen.com" },
};

type JsonApi<T> = { data: T };
type LetterResource = {
  id: string;
  type: "letters";
  attributes: {
    status: string;
    file_pages?: number | null;
    country?: string | null;
    price_currency?: string | null;
    price_value?: number | null;
    tracking_number?: string | null;
    submitted_at?: string | null;
    delivery_product?: string | null;
  };
};

export class PingenCarrier implements Carrier {
  readonly name = "pingen";
  private token?: { value: string; expiresAt: number };
  private priceCache = new Map<string, { value: number; at: number }>();

  constructor(private cfg: PingenConfig) {}

  private get hosts() {
    return HOSTS[this.cfg.env];
  }
  private get base() {
    return `${this.hosts.api}/organisations/${this.cfg.organisationId}`;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) return this.token.value;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.cfg.clientId,
      client_secret: this.cfg.clientSecret,
    });
    if (this.cfg.scope) body.set("scope", this.cfg.scope);
    const res = await fetch(`${this.hosts.identity}/auth/access-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    if (!res.ok) throw new Error(`Pingen auth failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
    return this.token.value;
  }

  private async api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.accessToken();
    const url = path.startsWith("http") ? path : `${this.hosts.api}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
        ...(init.headers ?? {}),
      },
    });
    if (res.status === 204) return undefined as T;
    if (!res.ok) throw new Error(`Pingen ${init.method ?? "GET"} ${path} → ${res.status}: ${await res.text()}`);
    return (await res.json()) as T;
  }

  private post<T>(path: string, type: string, attributes: Record<string, unknown>): Promise<T> {
    return this.api<T>(path, {
      method: "POST",
      body: JSON.stringify({ data: { type, attributes, relationships: {} } }),
    });
  }

  async send(letter: Letter, opts: SendOptions): Promise<SendResult> {
    // 1. Upload-URL anfordern
    const upload = await this.api<JsonApi<{ attributes: { url: string; url_signature: string; expires_at: string } }>>("/file-upload");
    const { url, url_signature } = upload.data.attributes;

    // 2. PDF per PUT hochladen
    const put = await fetch(url, {
      method: "PUT",
      body: new Blob([letter.pdf as Uint8Array<ArrayBuffer>], { type: "application/pdf" }),
      headers: { "Content-Type": "application/pdf" },
    });
    if (!put.ok) throw new Error(`Pingen upload failed: ${put.status} ${await put.text()}`);

    // 3. Brief anlegen – auto_send verlangt delivery_product, print_mode, print_spectrum
    const created = await this.post<JsonApi<LetterResource>>(`${this.base}/deliveries/letters/`, "letters", {
      file_original_name: `${letter.id}.pdf`,
      file_url: url,
      file_url_signature: url_signature,
      address_position: "left",
      auto_send: true,
      delivery_product: "cheap",
      print_mode: opts.duplex ? "duplex" : "simplex",
      print_spectrum: opts.color ? "color" : "grayscale",
      meta_data: { letter_id: letter.id, customer: letter.customer },
    });
    return { carrierRef: created.data.id, carrierStatus: created.data.attributes.status };
  }

  async status(carrierRef: string): Promise<StatusResult> {
    const res = await this.api<JsonApi<LetterResource>>(`${this.base}/deliveries/letters/${carrierRef}`);
    const a = res.data.attributes;
    return { carrierStatus: a.status, status: mapStatus(a.status), deliveredAt: undefined };
  }

  async cancel(carrierRef: string): Promise<void> {
    await this.api(`${this.base}/deliveries/letters/${carrierRef}/cancel`, { method: "POST" });
  }

  /** Live-Preis aus dem Pingen-Preisrechner (10 min gecacht), Fallback: statische Näherung. */
  async quote(country: string, opts: SendOptions): Promise<number | undefined> {
    const key = `${country}|${opts.duplex}|${opts.color}`;
    const hit = this.priceCache.get(key);
    if (hit && Date.now() - hit.at < 10 * 60_000) return hit.value;
    try {
      const res = await this.post<JsonApi<{ attributes: { currency: string; price: number } }>>(
        `${this.base}/deliveries/letters/price-calculator`,
        "letter_price_calculator",
        {
          country: country.toUpperCase(),
          delivery_product: "cheap",
          print_mode: opts.duplex ? "duplex" : "simplex",
          print_spectrum: opts.color ? "color" : "grayscale",
          paper_types: ["normal"],
        },
      );
      const value = res.data.attributes.price;
      this.priceCache.set(key, { value, at: Date.now() });
      return value;
    } catch {
      return undefined;
    }
  }

  estimatePrice(pages: number, opts: SendOptions, country: string): number {
    const base = country === "DE" ? 0.86 : 1.4;
    const sheets = opts.duplex ? Math.ceil(pages / 2) : pages;
    return +(base + Math.max(0, sheets - 1) * 0.1 + (opts.color ? 0.1 * pages : 0)).toFixed(2);
  }

  /** Webhook bei Pingen registrieren (einmalig je Umgebung). event_category z. B. "issues". */
  async registerWebhook(eventCategory: string, url: string, signingKey: string): Promise<string> {
    const res = await this.post<JsonApi<{ id: string }>>(`${this.base}/webhooks`, "webhooks", {
      event_category: eventCategory,
      url,
      signing_key: signingKey,
    });
    return res.data.id;
  }

  /** Prüft die HMAC-Signatur eines eingehenden Webhooks. */
  verifyWebhook(rawBody: string, signatureHeader: string | undefined): boolean {
    if (!this.cfg.webhookSigningKey || !signatureHeader) return false;
    const expected = createHmac("sha256", this.cfg.webhookSigningKey).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signatureHeader.trim());
    return a.length === b.length && timingSafeEqual(a, b);
  }
}

export function mapStatus(s: string): LetterStatus {
  switch (s) {
    case "validating":
    case "valid":
    case "submitted":
    case "action_required":
      return "queued";
    case "sent":
    case "transferred":
    case "printing":
      return "sent";
    case "delivered":
      return "delivered";
    case "invalid":
    case "undeliverable":
      return "failed";
    case "cancelled":
    case "canceled":
      return "cancelled";
    default:
      return "queued";
  }
}
