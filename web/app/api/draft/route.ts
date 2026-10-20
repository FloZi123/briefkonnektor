import { NextResponse } from "next/server";
import { draftLetter } from "@/lib/ai";
import type { Draft } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Texterstellung ist nicht konfiguriert" }, { status: 503 });
  const { draft, instruction } = (await req.json()) as { draft: Draft; instruction?: string };
  if (!draft?.recipient?.name || !draft?.sender?.name) return NextResponse.json({ error: "Empfänger und Absender fehlen" }, { status: 400 });
  try {
    const body = await draftLetter(draft, instruction);
    return NextResponse.json({ body });
  } catch (e) {
    console.error("draft failed", e);
    return NextResponse.json({ error: "Der Entwurf konnte gerade nicht erstellt werden. Bitte noch einmal versuchen." }, { status: 502 });
  }
}
