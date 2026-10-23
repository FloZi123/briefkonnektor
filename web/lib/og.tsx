import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Vorschaubild für Links (WhatsApp, Facebook, Google): Blatt mit Marker-Stellen, Wortmarke, Titel. */
export function ogImage(title: string, sub: string) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eef1f6", padding: 56, fontFamily: "sans-serif", color: "#0f1b3d" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingRight: 40 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>
            <span>flink</span>
            <span style={{ color: "#2f5bea" }}>brief</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
            <div style={{ fontSize: 28, color: "#5b6680", lineHeight: 1.3 }}>{sub}</div>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#5b6680" }}>
            <span>Fotografieren</span>
            <span>·</span>
            <span>Verstehen</span>
            <span>·</span>
            <span>Unterschreiben</span>
            <span>·</span>
            <span>Per Post</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 380,
            background: "#ffffff",
            borderRadius: 6,
            padding: "34px 30px",
            boxShadow: "0 20px 50px -20px rgba(15,27,61,.35)",
            transform: "rotate(-2deg)",
            fontSize: 15,
            color: "#1a1a1a",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666" }}>
            <span>Polizei Berlin</span>
            <span style={{ background: "#fff1a8", color: "#5a4500", padding: "0 6px" }}>Az. B-78/4412-26</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14, marginTop: 10 }}>
            <span>Lena Hartmann</span>
            <span>Kastanienallee 12</span>
            <span>10435 Berlin</span>
          </div>
          <div style={{ fontWeight: 700, marginTop: 14 }}>Bußgeldbescheid</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, lineHeight: 1.5 }}>
            <span>Geldbuße von</span>
            <span style={{ background: "#fff1a8", color: "#5a4500", padding: "0 6px" }}>115,00 €</span>
            <span>zuzüglich Gebühren. Einspruch</span>
            <span style={{ background: "#fff1a8", color: "#5a4500", padding: "0 6px" }}>innerhalb von zwei Wochen</span>
            <span>nach Zustellung.</span>
          </div>
          <div style={{ display: "flex", marginTop: 18, background: "#2f5bea", color: "#fff", borderRadius: 10, padding: "12px 16px", fontSize: 18, fontWeight: 700 }}>
            Einspruch bis 2. Nov.
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
