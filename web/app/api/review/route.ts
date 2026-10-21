import { NextResponse } from "next/server";
import { reviewLetter } from "@/lib/ai";
import type { Draft } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ points: [] });
  const { draft } = (await req.json()) as { draft: Draft };
  if (!draft?.body) return NextResponse.json({ points: [] });
  try {
    return NextResponse.json({ points: await reviewLetter(draft) });
  } catch (e) {
    console.error("review failed", e);
    return NextResponse.json({ points: [] }); // Prüfliste ist Zusatz – nie den Flow blockieren
  }
}
