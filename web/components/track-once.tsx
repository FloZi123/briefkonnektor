"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

/** Sendet ein Ereignis genau einmal pro Mount (ohne Browser-Speicher). Für Server-Seiten wie /brief/fertig. */
export function TrackOnce({ name, props }: { name: string; props?: Record<string, string | number | boolean> }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(name, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
