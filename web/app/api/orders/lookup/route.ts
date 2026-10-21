import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export const runtime = "nodejs";

/** Status-Abfrage ohne Konto: Bestellnummer + E-Mail müssen zusammenpassen, dann gibt es den Link mit Token. */
export async function POST(req: Request) {
  const { id, email } = (await req.json().catch(() => ({}))) as { id?: string; email?: string };
  const cleanId = (id ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const cleanMail = (email ?? "").trim().toLowerCase();
  if (!/^FB-\d{4}-[A-Z0-9]{6}$/.test(cleanId) || !cleanMail) return NextResponse.json({ error: "Bitte Bestellnummer (FB-2026-…) und E-Mail-Adresse angeben." }, { status: 400 });
  const o = await getOrder(cleanId);
  // gleiche Antwort für "nicht gefunden" und "E-Mail passt nicht" – kein Rückschluss auf existierende Nummern
  if (!o || o.email.trim().toLowerCase() !== cleanMail) return NextResponse.json({ error: "Keine Bestellung mit dieser Nummer und E-Mail-Adresse gefunden. Bestellungen werden nach 30 Tagen gelöscht." }, { status: 404 });
  return NextResponse.json({ url: `/brief/fertig?order=${o.id}&t=${o.token}` });
}
