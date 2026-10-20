import { randomBytes, randomUUID } from "node:crypto";
import type { Draft, Shipping } from "./types";

/**
 * Bestellungen – In-Memory für Entwicklung und Vercel-Preview.
 * Produktion: gleiche Schnittstelle gegen Supabase (Tabelle orders, PDFs in Storage, 30 Tage TTL).
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
  stripeSessionId?: string;
  lastError?: string;
}

const g = globalThis as unknown as { __fbOrders?: Map<string, Order> };
const orders = (g.__fbOrders ??= new Map<string, Order>());

const newId = () => "FB-" + new Date().getFullYear() + "-" + randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

export async function createOrder(draft: Draft, priceCents: number, priceLabel: string): Promise<Order> {
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
  };
  orders.set(o.id, o);
  return o;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  return orders.get(id);
}

export async function updateOrder(o: Order): Promise<Order> {
  orders.set(o.id, o);
  return o;
}

export async function findByStripeSession(sessionId: string): Promise<Order | undefined> {
  return [...orders.values()].find((o) => o.stripeSessionId === sessionId);
}
