import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/guide";
import { guideBySlug, CAMPAIGNS } from "@/lib/guides";

const base = () => (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de").replace(/\/$/, "");

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(CAMPAIGNS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = CAMPAIGNS[(await params).slug];
  const g = c && guideBySlug(c.guide);
  if (!g) return {};
  return { title: g.metaTitle, description: g.description, robots: { index: false, follow: true }, alternates: { canonical: `${base()}/ratgeber/${g.slug}` } };
}

export default async function AdLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CAMPAIGNS[slug];
  const g = c && guideBySlug(c.guide);
  if (!g) notFound();
  return <GuideArticle g={g} campaign={slug} />;
}
