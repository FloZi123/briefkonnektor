import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

/**
 * Interesse an „prüfen lassen“ (Vermittlungs-Test): speichert E-Mail, PLZ (optional), Anlass und Kampagne.
 * Kein Versand, keine Zahlung – nur die Liste, die wir anschreiben, sobald ein Partner steht.
 * Ohne Supabase-Konfiguration wird nur geloggt, damit der Flow lokal nicht bricht.
 */
const ANLASS = new Set(["nebenkosten", "steuer", "bussgeld", "jobcenter", "krankenkasse", "rente", "rundfunk", "mahnung"]);

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; plz?: string; anlass?: string; campaign?: string; consent?: boolean };
  const email = (body.email ?? "").trim().toLowerCase();
  const plz = (body.plz ?? "").trim().replace(/\s+/g, "");
  const anlass = (body.anlass ?? "").trim().toLowerCase();
  const campaign = (body.campaign ?? "").trim().slice(0, 80) || null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
  if (plz && !/^\d{5}$/.test(plz)) return NextResponse.json({ error: "Die Postleitzahl hat fünf Ziffern." }, { status: 400 });
  if (!ANLASS.has(anlass)) return NextResponse.json({ error: "Unbekannter Anlass." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Bitte bestätigen Sie, dass wir Sie per E-Mail kontaktieren dürfen." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("interesse: SUPABASE fehlt – nur geloggt", { anlass, plz, campaign });
    return NextResponse.json({ ok: true });
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await sb.from("interest").insert({ email, plz: plz || null, anlass, campaign });
  if (error) {
    console.error("interesse: insert fehlgeschlagen", error.message);
    return NextResponse.json({ error: "Speichern hat nicht geklappt. Bitte später noch einmal versuchen." }, { status: 500 });
  }
  // Concierge: jede Anfrage sofort ins Postfach, damit die 2-Werktage-Zusage gehalten wird (Fehler hier blockieren nicht)
  const text = `Neue Prüfanfrage (${anlass})\n\nE-Mail: ${email}\nPLZ: ${plz || "–"}\nKampagne: ${campaign ?? "–"}\n\nAntwort innerhalb von zwei Werktagen zugesagt.`;
  sendMail("info@flinkbrief.de", `Prüfanfrage ${anlass}${plz ? " · PLZ " + plz : ""}`, `<pre style="font:14px/1.5 sans-serif">${text}</pre>`, text).catch((e) => console.warn("interesse: Benachrichtigung fehlgeschlagen", e));
  return NextResponse.json({ ok: true });
}
