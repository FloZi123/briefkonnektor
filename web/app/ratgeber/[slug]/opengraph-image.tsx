import { ogImage, OG_SIZE } from "@/lib/og";
import { GUIDES, guideBySlug } from "@/lib/guides";

export const runtime = "nodejs";
export const alt = "Flinkbrief Ratgeber";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  return ogImage(g?.title ?? "Ratgeber", g ? `Frist: ${g.deadlineShort}. ${g.description}` : "");
}
