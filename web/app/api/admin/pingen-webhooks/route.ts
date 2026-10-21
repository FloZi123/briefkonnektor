import { NextResponse } from "next/server";
import { getCarrier } from "@core/carriers/index";
import { PingenCarrier } from "@core/carriers/pingen";

export const runtime = "nodejs";

/** Einmalig: Webhooks bei Pingen registrieren (sent, undeliverable, issues). Geschützt mit CRON_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const carrier = getCarrier();
  if (!(carrier instanceof PingenCarrier)) return NextResponse.json({ error: "pingen not active (CARRIER)" }, { status: 400 });
  const mask = (v?: string) => (v ? `${v.slice(0, 4)}…${v.slice(-3)} (${v.length} Zeichen)` : "fehlt");
  const diag = { env: process.env.PINGEN_ENV, clientId: mask(process.env.PINGEN_CLIENT_ID?.trim()), secret: mask(process.env.PINGEN_CLIENT_SECRET?.trim()), org: mask(process.env.PINGEN_ORGANISATION_ID?.trim()) };
  const key = process.env.PINGEN_WEBHOOK_SIGNING_KEY;
  if (!key) return NextResponse.json({ error: "PINGEN_WEBHOOK_SIGNING_KEY fehlt" }, { status: 400 });
  const url = `${(process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")}/api/webhooks/pingen`;
  const out: Record<string, string> = {};
  for (const cat of ["sent", "undeliverable", "issues"]) {
    try {
      out[cat] = await carrier.registerWebhook(cat, url, key);
    } catch (e) {
      out[cat] = "FEHLER: " + (e instanceof Error ? e.message : String(e));
    }
  }
  return NextResponse.json({ url, webhooks: out, diag });
}
