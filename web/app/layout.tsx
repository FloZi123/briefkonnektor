import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Schriften werden beim Build geladen und von der eigenen Domain ausgeliefert – kein Request an Google zur Laufzeit.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display-src", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans-src", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono-src", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Flinkbrief", template: "%s – Flinkbrief" },
  description: "Bescheid fotografieren, Widerspruch fertig. Wir formulieren nach Ihren Angaben und verschicken per Post.",
  applicationName: "Flinkbrief",
};

export const viewport: Viewport = { themeColor: "#2f5bea", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
