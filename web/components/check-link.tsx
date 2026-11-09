"use client";
import Link from "next/link";
import { track } from "@/lib/track";

/** Zweiter Weg auf der Anzeigen-Einstiegsseite: inhaltliche Prüfung durch einen Partner (Test, siehe /pruefen-lassen). */
export function CheckLink({ anlass, label }: { anlass: string; label: string }) {
  return (
    <Link href={`/pruefen-lassen?anlass=${anlass}`} className="btn btn-secondary check-link" onClick={() => track("check_click", { anlass })}>
      {label} →
    </Link>
  );
}
