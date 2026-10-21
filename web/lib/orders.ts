import { randomBytes, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Draft, Shipping } from "./types";

/**
 * Bestellungen.
 *  - Supabase (Tabelle orders + Bucket letters), sobald SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY gesetzt sind
 *  - sonst In-Memory (lokale Entwicklung, Preview ohne Datenbank)
 * Der Entwurf wird beim Checkout gespeichert, damit der Stripe-Webhook ihn ohne Browser verarbeiten kann.
 */
export type OrderStatus = "pending" | "paid" | "queued" | "sent" | "delivered" | "failed";

export interface Order {
  id: string;
  token: string; // für den PDF-Download-Link
  createdAt: string;
  status: OrderStatus;
  shipping: Shipping;
  priceCents: number;
  priceLabel: string;
  email: string;
  subject: string;
  recipientName: string;
  deadline?: string;
  draft: Draft;
  pdf?: Uint8Array;
  carrierRef?: string;
  carrierStatus?: string;
  trackingNumber?: string;
  stripeSessionId?: string;
  lastError?: string;
}

interface OrderStore {
  create(o: Order): Promise<Order>;
  get(id: string, withPdf: boolean): Promise<Order | undefined>;
  update(o: Order): Promise<Order>;
  findByStripeSession(sessionId: string): Promise<Order | undefined>;
  findByCarrierRef(ref: string): Promise<Order | undefined>;
}

/* ---------- In-Memory ---------- */

const g = globalThis as unknown as { __fbOrders?: Map<string, Order> };
const mem = (g.__fbOrders ??= new Map<string, Order>());

const memoryStore: OrderStore = {
  async create(o) {
    mem.set(o.id, o);
    return o;
  },
  async get(id) {
    return mem.get(id);
  },
  async update(o) {
    mem.set(o.id, o);
    return o;
  },
  async findByStripeSession(sessionId) {
    return [...mem.values()].find((o) => o.stripeSessionId === sessionId);
  },
  async findByCarrierRef(ref) {
    return [...mem.values()].find((o) => o.carrierRef === ref);
  },
};

/* ---------- Supabase ---------- */

const BUCKET = "letters";

interface Row {
  id: string;
  token: string;
  created_at: string;
  status: OrderStatus;
  shipping: Shipping;
  price_cents: number;
  price_label: string;
  email: string;
  subject: string;
  recipient_name: string;
  deadline: string | null;
  draft: Draft;
  pdf_path: string | null;
  carrier_ref: string | null;
  carrier_status: string | null;
  tracking_number: string | null;
  stripe_session_id: string | null;
  last_error: string | null;
}

/** TT.MM.JJJJ ↔ ISO (Postgres date) */
const toIsoDate = (de?: string) => {
  const m = de?.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
};
const fromIsoDate = (iso?: string | null) => {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : undefined;
};

const toRow = (o: Order): Omit<Row, "created_at"> & { created_at?: string } => ({
  id: o.id,
  token: o.token,
  created_at: o.createdAt,
  status: o.status,
  shipping: o.shipping,
  price_cents: o.priceCents,
  price_label: o.priceLabel,
  email: o.email,
  subject: o.subject,
  recipient_name: o.recipientName,
  deadline: toIsoDate(o.deadline),
  draft: o.draft,
  pdf_path: o.pdf ? `${o.id}.pdf` : null,
  carrier_ref: o.carrierRef ?? null,
  carrier_status: o.carrierStatus ?? null,
  tracking_number: o.trackingNumber ?? null,
  stripe_session_id: o.stripeSessionId ?? null,
  last_error: o.lastError ?? null,
});

const fromRow = (r: Row): Order => ({
  id: r.id,
  token: r.token,
  createdAt: r.created_at,
  status: r.status,
  shipping: r.shipping,
  priceCents: r.price_cents,
  priceLabel: r.price_label,
  email: r.email,
  subject: r.subject,
  recipientName: r.recipient_name,
  deadline: fromIsoDate(r.deadline),
  draft: r.draft,
  carrierRef: r.carrier_ref ?? undefined,
  carrierStatus: r.carrier_status ?? undefined,
  trackingNumber: r.tracking_number ?? undefined,
  stripeSessionId: r.stripe_session_id ?? undefined,
  lastError: r.last_error ?? undefined,
});

function supabaseStore(sb: SupabaseClient): OrderStore {
  const uploadPdf = async (o: Order) => {
    if (!o.pdf) return;
    const { error } = await sb.storage.from(BUCKET).upload(`${o.id}.pdf`, Buffer.from(o.pdf), { contentType: "application/pdf", upsert: true });
    if (error) throw new Error(`pdf upload: ${error.message}`);
  };
  const loadPdf = async (o: Order, path: string | null) => {
    if (!path) return;
    const { data, error } = await sb.storage.from(BUCKET).download(path);
    if (error) throw new Error(`pdf download: ${error.message}`);
    o.pdf = new Uint8Array(await data.arrayBuffer());
  };
  return {
    async create(o) {
      await uploadPdf(o);
      const { error } = await sb.from("orders").insert(toRow(o));
      if (error) throw new Error(`orders insert: ${error.message}`);
      return o;
    },
    async get(id, withPdf) {
      const { data, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle<Row>();
      if (error) throw new Error(`orders select: ${error.message}`);
      if (!data) return undefined;
      const o = fromRow(data);
      if (withPdf) await loadPdf(o, data.pdf_path);
      return o;
    },
    async update(o) {
      await uploadPdf(o);
      const row = toRow(o);
      delete row.created_at;
      if (!o.pdf) delete (row as { pdf_path?: string | null }).pdf_path; // vorhandenes PDF nicht überschreiben
      const { error } = await sb.from("orders").update(row).eq("id", o.id);
      if (error) throw new Error(`orders update: ${error.message}`);
      return o;
    },
    async findByStripeSession(sessionId) {
      const { data, error } = await sb.from("orders").select("*").eq("stripe_session_id", sessionId).maybeSingle<Row>();
      if (error) throw new Error(`orders select: ${error.message}`);
      return data ? fromRow(data) : undefined;
    },
    async findByCarrierRef(ref) {
      const { data, error } = await sb.from("orders").select("*").eq("carrier_ref", ref).maybeSingle<Row>();
      if (error) throw new Error(`orders select: ${error.message}`);
      return data ? fromRow(data) : undefined;
    },
  };
}

/* ---------- Auswahl ---------- */

let store: OrderStore | undefined;
function getStore(): OrderStore {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    store = supabaseStore(createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }));
  } else {
    if (process.env.NODE_ENV === "production") console.warn("orders: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY fehlen – Bestellungen nur im Speicher");
    store = memoryStore;
  }
  return store;
}

export const ordersBackend = () => (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "memory");

const newId = () => "FB-" + new Date().getFullYear() + "-" + randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

export async function createOrder(draft: Draft, priceCents: number, priceLabel: string, pdf?: Uint8Array): Promise<Order> {
  const o: Order = {
    id: newId(),
    token: randomBytes(16).toString("hex"),
    createdAt: new Date().toISOString(),
    status: "pending",
    shipping: draft.shipping,
    priceCents,
    priceLabel,
    email: draft.email,
    subject: draft.subject,
    recipientName: draft.recipient.name,
    deadline: draft.deadline,
    draft,
    pdf,
  };
  return getStore().create(o);
}

/** withPdf: PDF aus dem Storage mitladen (Download-Route, Versand). */
export async function getOrder(id: string, opts: { withPdf?: boolean } = {}): Promise<Order | undefined> {
  return getStore().get(id, opts.withPdf ?? false);
}

export async function updateOrder(o: Order): Promise<Order> {
  return getStore().update(o);
}

export async function findByStripeSession(sessionId: string, opts: { withPdf?: boolean } = {}): Promise<Order | undefined> {
  const o = await getStore().findByStripeSession(sessionId);
  if (o && opts.withPdf && !o.pdf) return getStore().get(o.id, true);
  return o;
}

export async function findByCarrierRef(ref: string): Promise<Order | undefined> {
  return getStore().findByCarrierRef(ref);
}
