import { NextResponse } from "next/server";
import { getCarrier } from "@core/carriers/index";
import { PingenCarrier } from "@core/carriers/pingen";
import { findByCarrierRef, updateOrder } from "@/lib/orders";
import { sendStatusMail } from "@/lib/mail";

export const runtime = "nodejs";

/**
 * Pingen-Webhook (Kategorien sent / undeliverable / issues). Signatur = HMAC-SHA256 des Rohbodys im Header "Signature".
 * Wir verlassen uns nicht auf den Payload, sondern fragen den Brief-Status bei Pingen nach und aktualisieren die Bestellung.
 */
export async function POST(req: Request) {
  const carrier = getCarrier();
  if (!(carrier instanceof PingenCarrier)) return NextResponse.json({ error: "pingen not active" }, { status: 404 });
  const raw = await req.text();
  if (!carrier.verifyWebhook(raw, req.headers.get("signature") ?? undefined)) return NextResponse.json({ error: "bad signature" }, { status: 401 });

  let letterRef: string | undefined;
  try {
    const payload = JSON.parse(raw) as { data?: { type?: string; relationships?: { letter?: { data?: { id?: string } } } } };
    letterRef = payload.data?.relationships?.letter?.data?.id;
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }
  if (!letterRef) return NextResponse.json({ received: true, ignored: "no letter" });

  const order = await findByCarrierRef(letterRef);
  if (!order) return NextResponse.json({ received: true, ignored: "unknown letter" });

  try {
    const s = await carrier.status(letterRef);
    const before = order.status;
    const mapped: typeof order.status | null = s.status === "sent" ? "sent" : s.status === "delivered" ? "delivered" : s.status === "failed" ? "failed" : null;
    if (mapped) order.status = mapped; // "queued"/"draft" vom Carrier überschreiben den Bestellstatus nicht
    order.carrierStatus = s.carrierStatus;
    if (s.trackingNumber) order.trackingNumber = s.trackingNumber;
    await updateOrder(order);
    if (before !== order.status && (order.status === "sent" || order.status === "failed")) await sendStatusMail(order, order.status);
  } catch (e) {
    console.error("pingen webhook processing failed", letterRef, e);
    return NextResponse.json({ received: true, error: "processing" }, { status: 202 });
  }
  return NextResponse.json({ received: true });
}
