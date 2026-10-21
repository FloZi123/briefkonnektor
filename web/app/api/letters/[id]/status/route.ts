import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { reconcileWithStripe, syncCarrierStatus } from "@/lib/finalize";

export const runtime = "nodejs";

/** Status einer Bestellung (mit Token) – für die Live-Aktualisierung der Bestätigungsseite. Bei "pending" wird Stripe befragt. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = new URL(req.url).searchParams.get("t");
  let o = await getOrder(id);
  if (!o || !t || t !== o.token) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (o.status === "pending") o = await reconcileWithStripe(o);
  else if (o.status === "queued" || o.status === "sent") o = await syncCarrierStatus(o);
  return NextResponse.json({ status: o.status, carrierStatus: o.carrierStatus, trackingNumber: o.trackingNumber }, { headers: { "cache-control": "no-store" } });
}
