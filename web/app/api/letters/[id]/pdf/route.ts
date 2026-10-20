import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = new URL(req.url).searchParams.get("t");
  const o = await getOrder(id);
  if (!o || !t || t !== o.token) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (o.status === "pending") return NextResponse.json({ error: "Zahlung noch nicht bestätigt" }, { status: 402 });
  if (!o.pdf) return NextResponse.json({ error: "PDF nicht verfügbar" }, { status: 404 });
  return new NextResponse(Buffer.from(o.pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="Flinkbrief-${o.id}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
