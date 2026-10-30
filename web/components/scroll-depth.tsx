"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * Meldet einmal je Seitenaufruf, wie weit gescrollt wurde (25/50/75/100 %) – zeigt, ob Besucher lesen oder sofort gehen.
 * Ohne Browser-Speicher; endet nach 100 %. Nur auf Anzeigen-Einstiegsseiten eingebunden.
 */
export function ScrollDepth({ page }: { page: string }) {
  useEffect(() => {
    const marks = [25, 50, 75, 100];
    const sent = new Set<number>();
    const check = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total <= 0 ? 100 : Math.min(100, Math.round(((window.scrollY + 1) / total) * 100));
      for (const m of marks) {
        if (pct >= m && !sent.has(m)) {
          sent.add(m);
          track("scroll_depth", { depth: m, page });
        }
      }
      if (sent.size === marks.length) window.removeEventListener("scroll", check);
    };
    window.addEventListener("scroll", check, { passive: true });
    const t = window.setTimeout(check, 1500); // Startposition nach dem Laden (kurze Seiten zählen sofort)
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", check);
    };
  }, [page]);
  return null;
}
