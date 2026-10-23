import type { Metadata } from "next";

/** Flow-Seiten sind persönlich und nicht für Suchmaschinen gedacht. */
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Brief erstellen" };

export default function BriefLayout({ children }: { children: React.ReactNode }) {
  return children;
}
