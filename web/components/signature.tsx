"use client";
import { useEffect, useRef, useState } from "react";

/** Unterschriftenfeld: Pointer-Events auf Canvas, liefert PNG (transparent) als Data-URL. */
export function SignaturePad({ value, onChange }: { value?: string; onChange: (dataUrl: string | undefined) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(!value);
  const [thick, setThick] = useState(false);

  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#16203a";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineWidth = thick ? 3.2 : 2.2;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (empty) setEmpty(false);
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onChange(ref.current!.toDataURL("image/png"));
  };
  const clear = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
    onChange(undefined);
  };

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="sigpad">
        <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} aria-label="Unterschriftenfeld" role="img" />
        <span className="base" />
        {empty && (
          <span className="muted" style={{ position: "absolute", left: 24, bottom: 20, fontSize: 12, pointerEvents: "none" }}>
            Hier unterschreiben
          </span>
        )}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="chip" onClick={clear}>
          Löschen
        </button>
        <button type="button" className="chip" aria-pressed={thick} onClick={() => setThick((t) => !t)} style={thick ? { borderColor: "var(--ink)" } : undefined}>
          Dicker Stift
        </button>
      </div>
    </div>
  );
}
