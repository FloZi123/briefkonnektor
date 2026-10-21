import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";
import { dispatchOrder } from "@/lib/letter";
import { sendStatusMail } from "@/lib/mail";

export const runtime = "nodejs";

/** Versand einer fehlgeschlagenen (oder noch nicht übergebenen) bezahlten Bestellung erneut anstoßen. POST {id}; CRON_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id fehlt" }, { status: 400 });
  const o = await getOrder(id, { withPdf: true });
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (o.status === "pending") return NextResponse.json({ error: "noch nicht bezahlt" }, { status: 409 });
  if (o.status !== "failed" && o.status !== "paid") return NextResponse.json({ error: `Status ${o.status} – kein Retry nötig` }, { status: 409 });
  o.lastError = undefined;
  const done = await updateOrder(await dispatchOrder(o));
  if (done.status === "sent") await sendStatusMail(done, "sent");
  return NextResponse.json({ id: done.id, status: done.status, carrierRef: done.carrierRef, error: done.lastError });
}
