import Link from "next/link";
import { Logo } from "@/components/ui";
import { getOrder } from "@/lib/orders";
import { PRICES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FertigScreen({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: id } = await searchParams;
  const order = id ? await getOrder(id) : undefined;

  if (!order) {
    return (
      <main className="screen">
        <div className="screen-head"><Logo /></div>
        <div className="stack" style={{ paddingTop: 40, alignItems: "center", textAlign: "center" }}>
          <h1 style={{ fontSize: 24 }}>Bestellung nicht gefunden</h1>
          <p className="muted">Der Link ist ungültig oder abgelaufen. Prüfen Sie die Bestätigungs-E-Mail.</p>
          <Link href="/" className="btn btn-secondary" style={{ marginTop: 16 }}>Zur Startseite</Link>
        </div>
      </main>
    );
  }

  const paid = order.status !== "pending";
  const isDownload = order.shipping === "download";
  const steps = isDownload
    ? [
        { t: "Bezahlt", s: paid ? "done" : "now" },
        { t: "PDF erstellt", s: paid ? "done" : "" },
      ]
    : [
        { t: "Bezahlt", s: paid ? "done" : "now" },
        { t: "An Druckzentrum übergeben", s: order.status === "queued" || order.status === "sent" || order.status === "delivered" ? "done" : paid ? "now" : "" },
        { t: "Gedruckt & bei der Post eingeliefert", s: order.status === "sent" || order.status === "delivered" ? "done" : order.status === "queued" ? "now" : "" },
        { t: "Zugestellt", s: order.status === "delivered" ? "done" : "" },
      ];

  return (
    <main className="screen">
      <div className="screen-head"><Logo /></div>
      <div className="stack" style={{ paddingTop: 32, alignItems: "center", textAlign: "center", gap: 14 }}>
        <span style={{ width: 64, height: 64, borderRadius: "50%", background: paid ? "var(--zugestellt)" : "var(--paper-200)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={paid ? "#fff" : "var(--ink-muted)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paid ? <path d="M20 6L9 17l-5-5" /> : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}
          </svg>
        </span>
        <h1 style={{ fontSize: 26 }}>{paid ? (isDownload ? "Ihr PDF ist fertig." : "Ihr Brief geht raus.") : "Zahlung wird geprüft …"}</h1>
        <p className="muted" style={{ fontSize: 14 }}>
          {order.subject} an {order.recipientName}. Bestätigung und Rechnung gehen an {order.email}.
        </p>
        <span className="mono" style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, background: "var(--paper-200)" }}>Bestellung {order.id}</span>
      </div>

      <div className="card timeline" style={{ marginTop: 24, padding: 16 }}>
        {steps.map((s) => (
          <div className="step" key={s.t}>
            <span className={`dot ${s.s}`}>{s.s === "done" && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>}</span>
            <span><strong>{s.t}</strong></span>
          </div>
        ))}
      </div>

      {order.deadline && (
        <div className="fristbox" style={{ marginTop: 14 }}>
          <span><strong>Fristerinnerung:</strong> Wir erinnern Sie per E-Mail, falls bis {order.deadline} keine Antwort kommt.</span>
        </div>
      )}

      <div className="screen-foot">
        {paid && (
          <a className="btn btn-primary" href={`/api/letters/${order.id}/pdf?t=${order.token}`}>
            {isDownload ? "PDF herunterladen" : "PDF-Kopie herunterladen"}
          </a>
        )}
        <Link href="/" className="btn btn-secondary">Weiteren Brief schreiben</Link>
        <span className="muted" style={{ fontSize: 11, textAlign: "center" }}>{PRICES[order.shipping].label} · {order.priceLabel}</span>
      </div>
    </main>
  );
}
