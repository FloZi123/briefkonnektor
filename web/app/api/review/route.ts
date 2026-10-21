import { NextResponse } from "next/server";
import { reviewLetter, suggestFills } from "@/lib/ai";
import { findPlaceholders } from "@/lib/placeholders";
import type { Draft } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Prüfliste + Ausfüllhilfe für Platzhalter – beides Zusatz, nie blockierend. */
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ points: [], fills: [] });
  const { draft } = (await req.json()) as { draft: Draft };
  if (!draft?.body) return NextResponse.json({ points: [], fills: [] });
  const placeholders = findPlaceholders(draft.body);
  const [points, fills] = await Promise.all([
    reviewLetter(draft).catch((e) => (console.error("review failed", e), [])),
    suggestFills(draft, placeholders).catch((e) => (console.error("fills failed", e), [])),
  ]);
  return NextResponse.json({ points, fills });
}
