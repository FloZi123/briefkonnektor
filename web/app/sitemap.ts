import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const b = base();
  const now = new Date();
  return [
    { url: `${b}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${b}/ratgeber`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...GUIDES.map((g) => ({ url: `${b}/ratgeber/${g.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${b}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${b}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${b}/agb`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${b}/widerruf`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
