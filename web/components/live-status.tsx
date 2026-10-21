"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Solange die Zahlung geprüft wird: alle 2 s nachsehen und die Seite erneuern, sobald sich der Status ändert. */
export function LiveStatus({ id, token, status }: { id: string; token: string; status: string }) {
  const router = useRouter();
  useEffect(() => {
    if (status !== "pending" && status !== "queued") return;
    const interval = status === "pending" ? 2000 : 15000;
    let stop = false;
    let tries = 0;
    const tick = async () => {
      if (stop || tries++ > (status === "pending" ? 45 : 20)) return; // pending: ~90 s, queued: ~5 min
      try {
        const r = await fetch(`/api/letters/${id}/status?t=${token}`, { cache: "no-store" });
        const d = (await r.json()) as { status?: string };
        if (d.status && d.status !== status) {
          router.refresh();
          return;
        }
      } catch {}
      setTimeout(tick, interval);
    };
    const h = setTimeout(tick, 1500);
    return () => {
      stop = true;
      clearTimeout(h);
    };
  }, [id, token, status, router]);
  return null;
}
