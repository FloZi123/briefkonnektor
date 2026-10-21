import { NextResponse } from "next/server";
import { OPERATOR } from "@/lib/legal";
import { lookupAddressWeb } from "@/lib/ai";

export const runtime = "nodejs";

/**
 * Adress-Vervollständigung.
 *  ?q=Jobcenter Schwandorf        → Treffer aus OpenStreetMap (Nominatim) mit Straße, PLZ, Ort
 *  ?zip=92421                      → Ort(e) zur PLZ (OpenPLZ API, amtliche Daten)
 * Beide Dienste sind kostenlos; Nominatim verlangt einen identifizierenden User-Agent und max. 1 Anfrage/s.
 */
const UA = `Flinkbrief/1.0 (${OPERATOR.email})`;

export interface AddressHit {
  name: string;
  street: string;
  zip: string;
  city: string;
  label: string;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();
  const zip = u.searchParams.get("zip")?.trim();

  if (zip && /^\d{5}$/.test(zip)) {
    try {
      const res = await fetch(`https://openplzapi.org/de/Localities?postalCode=${zip}`, { headers: { Accept: "application/json", "User-Agent": UA }, next: { revalidate: 86400 } });
      const data = (await res.json()) as Array<{ name: string }>;
      const cities = Array.from(new Set((data ?? []).map((x) => x.name))).slice(0, 5);
      return NextResponse.json({ cities });
    } catch {
      return NextResponse.json({ cities: [] });
    }
  }

  if (q && q.length >= 3) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=de&limit=5&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": UA, "Accept-Language": "de" }, next: { revalidate: 3600 } });
      const data = (await res.json()) as Array<{ display_name: string; name?: string; address?: Record<string, string> }>;
      const hits: AddressHit[] = (data ?? [])
        .map((x) => {
          const a = x.address ?? {};
          const street = [a.road, a.house_number].filter(Boolean).join(" ");
          const city = a.city || a.town || a.village || a.municipality || "";
          return { name: x.name || a.amenity || a.office || a.building || "", street, zip: a.postcode ?? "", city, label: x.display_name };
        })
        .filter((h) => h.street && h.zip && h.city);
      // Duplikate (gleiche Straße+PLZ) entfernen
      const seen = new Set<string>();
      const unique = hits.filter((h) => {
        const k = `${h.street}|${h.zip}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      const good = unique.filter((h) => /\d/.test(h.street)); // mit Hausnummer
      if (good.length) return NextResponse.json({ hits: good.slice(0, 4), source: "osm" });
      // Fallback: KI mit Websuche (offizielle Seiten)
      if (process.env.ANTHROPIC_API_KEY) {
        const web = await lookupAddressWeb(q);
        if (web.length) return NextResponse.json({ hits: web.map((h) => ({ ...h, label: h.source ?? "" })), source: "web" });
      }
      return NextResponse.json({ hits: unique.slice(0, 4), source: "osm" });
    } catch {
      return NextResponse.json({ hits: [] });
    }
  }
  return NextResponse.json({ hits: [], cities: [] });
}
