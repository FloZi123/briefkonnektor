import { NextResponse } from "next/server";
import { renderDraft } from "@/lib/letter";
import type { Draft } from "@/lib/types";

export const runtime = "nodejs";

/** Vorschau-PDF aus dem aktuellen Entwurf (POST mit Draft im Body). GET ohne Body zeigt einen Hinweis. */
export async function POST(req: Request) {
  const { draft } = (await req.json()) as { draft: Draft };
  if (!draft?.body) return NextResponse.json({ error: "Kein Entwurf" }, { status: 400 });
  const { pdf } = await renderDraft(draft);
  return new NextResponse(Buffer.from(pdf), { headers: { "content-type": "application/pdf", "content-disposition": 'inline; filename="Vorschau.pdf"', "cache-control": "no-store" } });
}

export async function GET() {
  return NextResponse.json({ error: "Vorschau wird per POST mit dem Entwurf erzeugt" }, { status: 405 });
}
