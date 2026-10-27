"use client";
import { useEffect, useRef } from "react";
import { setAttribution } from "@/lib/store";
import { track } from "@/lib/track";

/** Merkt sich die Kampagnen-Kennung der Einstiegsseite (nur ein Schlagwort, keine ID, 30 Tage) und meldet den Besuch einmal. */
export function Attribution({ campaign }: { campaign: string }) {
  const sent = useRef(false);
  useEffect(() => {
    setAttribution(campaign);
    if (sent.current) return;
    sent.current = true;
    track("landing_view", { campaign });
  }, [campaign]);
  return null;
}
