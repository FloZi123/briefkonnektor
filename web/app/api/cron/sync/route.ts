import { NextResponse } from "next/server";
import { listOpenOrders } from "@/lib/orders";
import { reconcileWithStripe, syncCarrierStatus } from "@/lib/finalize";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Stündlicher Abgleich (vercel.json) – Sicherheitsnetz, falls Webhooks von Stripe oder Pingen ausbleiben:
 *  - pending + Stripe-Session älter als 10 Minuten → bei Stripe nachsehen, ggf. abschließen (Versand, Bestätigungsmail)
 *  - queued/sent mit Carrier-Referenz → Status bei Pingen holen, ggf. Statusmail (versendet / Problem)
 * Vercel ruft die Route mit "Authorization: Bearer <CRON_SECRET>" auf.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const open = await listOpenOrders();
  const cutoff = Date.now() - 10 * 60 * 1000;
  const result = { checked: open.length, paid: 0, carrierChanged: 0, errors: [] as string[] };

  for (const o of open) {
    try {
      if (o.status === "pending") {
        if (o.stripeSessionId && new Date(o.createdAt).getTime() < cutoff) {
          const r = await reconcileWithStripe(o);
          if (r.status !== "pending") result.paid++;
        }
        continue;
      }
      const before = `${o.status}/${o.carrierStatus ?? ""}/${o.trackingNumber ?? ""}`;
      const r = await syncCarrierStatus(o);
      if (`${r.status}/${r.carrierStatus ?? ""}/${r.trackingNumber ?? ""}` !== before) result.carrierChanged++;
    } catch (e) {
      result.errors.push(`${o.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (result.errors.length) console.error("cron sync", result.errors);
  return NextResponse.json(result);
}
