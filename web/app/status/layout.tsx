import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Meine Briefe – Status" };

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
