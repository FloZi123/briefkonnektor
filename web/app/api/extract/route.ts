import { NextResponse } from "next/server";
import { extractFromDocument } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX = 12 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Erkennung ist nicht konfiguriert" }, { status: 503 });
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Datei ist größer als 12 MB" }, { status: 413 });
  const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!ALLOWED.has(mime)) return NextResponse.json({ error: "Bitte ein Foto (JPG/PNG) oder PDF hochladen" }, { status: 415 });
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await extractFromDocument(bytes, mime);
    // Das Bild wird nicht gespeichert – es lebt nur in dieser Anfrage.
    return NextResponse.json(result);
  } catch (e) {
    console.error("extract failed", e);
    return NextResponse.json({ error: "Das Foto konnte nicht gelesen werden. Bitte noch einmal aufnehmen, am besten bei Tageslicht und gerade von oben." }, { status: 422 });
  }
}
