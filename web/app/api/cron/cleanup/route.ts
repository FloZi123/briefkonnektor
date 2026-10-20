import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Täglicher Vercel-Cron (siehe vercel.json): löscht Bestellungen nach Ablauf (30 Tage) samt PDF im Storage.
 * Vercel ruft die Route mit "Authorization: Bearer <CRON_SECRET>" auf.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ skipped: "supabase not configured" });

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: expired, error } = await sb.from("orders").select("id, pdf_path").lt("expires_at", new Date().toISOString()).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!expired?.length) return NextResponse.json({ deleted: 0 });

  const paths = expired.map((o) => o.pdf_path).filter((p): p is string => !!p);
  if (paths.length) {
    const { error: se } = await sb.storage.from("letters").remove(paths);
    if (se) return NextResponse.json({ error: `storage: ${se.message}` }, { status: 500 });
  }
  const { error: de } = await sb.from("orders").delete().in("id", expired.map((o) => o.id));
  if (de) return NextResponse.json({ error: de.message }, { status: 500 });

  return NextResponse.json({ deleted: expired.length, pdfs: paths.length });
}
