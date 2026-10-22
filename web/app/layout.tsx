import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Schriften werden beim Build geladen und von der eigenen Domain ausgeliefert – kein Request an Google zur Laufzeit.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display-src", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans-src", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono-src", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.flinkbrief.de"),
  title: { default: "Flinkbrief – Bescheid fotografieren, Widerspruch per Post", template: "%s – Flinkbrief" },
  description: "Behördenbrief fotografieren, in einfachen Worten verstehen, Widerspruch oder Antwort formulieren lassen, mit dem Finger unterschreiben und per Post verschicken. Ab 4,99 €.",
  applicationName: "Flinkbrief",
  openGraph: { siteName: "Flinkbrief", locale: "de_DE", type: "website" },
};

export const viewport: Viewport = { themeColor: "#2f5bea", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
