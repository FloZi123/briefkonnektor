import type { MetadataRoute } from "next";

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/brief/", "/api/", "/status"] }],
    sitemap: `${base()}/sitemap.xml`,
  };
}
