"use client";
import { useEffect } from "react";
import { setAttribution } from "@/lib/store";

/** Merkt sich die Kampagnen-Kennung der Einstiegsseite (nur ein Schlagwort, keine ID, 30 Tage). */
export function Attribution({ campaign }: { campaign: string }) {
  useEffect(() => setAttribution(campaign), [campaign]);
  return null;
}
