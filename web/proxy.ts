import { NextResponse, type NextRequest } from "next/server";

/**
 * Eine kanonische Adresse: In Produktion werden flinkbrief.vercel.app, flinkbrief.com und www.flinkbrief.com
 * dauerhaft (308) auf www.flinkbrief.de umgeleitet – sonst indexieren Suchmaschinen Duplikate.
 * Preview-Deployments und lokale Entwicklung bleiben unberührt. Webhooks (/api/webhooks) nicht umleiten.
 */
const CANONICAL_HOST = "www.flinkbrief.de";

export function proxy(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();
  const host = req.headers.get("host")?.toLowerCase();
  if (!host || host === CANONICAL_HOST) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: ["/((?!_next/|_vercel/|favicon|icon|opengraph-image).*)"] };
