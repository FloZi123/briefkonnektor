import { renderLetter } from "@core/letter/render";
import { getCarrier } from "@core/carriers/index";
import type { Letter as CoreLetter } from "@core/types";
import { subjectLine } from "./subject";
import { today } from "./dates";
import type { Draft } from "./types";
import type { Order } from "./orders";

/** Nur noch echte Verstöße blockieren – Kürzungen nimmt der Renderer selbst vor. */
export function layoutProblem(warnings: string[]): string | null {
  if (warnings.some((w) => w.includes("über den Rand") || w.includes("Fensterzone"))) return "Der Brief passt nicht ins DIN-Layout – bitte Anschrift und Text prüfen.";
  return null;
}

/** DIN-5008-PDF aus dem Entwurf, inkl. Unterschrift. */
export async function renderDraft(d: Draft): Promise<{ pdf: Uint8Array; pages: number; warnings: string[] }> {
  const sig = d.signature?.startsWith("data:image/png;base64,") ? Buffer.from(d.signature.slice("data:image/png;base64,".length), "base64") : undefined;
  return renderLetter({
    sender: d.sender,
    recipient: d.recipient,
    subject: subjectLine(d.kind, d.subject, d.documentDate),
    body: d.body,
    date: today(),
    infoLines: d.reference ? [`Ihr Zeichen: ${d.reference}`] : undefined,
    signaturePng: sig,
    signatoryName: d.sender.name,
  });
}

/** Übergibt eine bezahlte Bestellung an den Carrier (post/registered). */
export async function dispatchOrder(o: Order): Promise<Order> {
  if (o.shipping === "download") {
    o.status = "paid";
    return o;
  }
  const carrier = getCarrier();
  const letter: CoreLetter = {
    id: o.id,
    customer: "flinkbrief",
    createdAt: o.createdAt,
    sender: o.draft.sender,
    recipient: o.draft.recipient,
    subject: o.subject,
    body: o.draft.body,
    date: today(),
    color: false,
    duplex: false,
    pdf: o.pdf!,
    pages: 1,
    status: "draft",
  };
  try {
    const r = await carrier.send(letter, { color: false, duplex: false, product: o.shipping === "registered" ? "registered" : "cheap" });
    o.carrierRef = r.carrierRef;
    o.status = "queued";
  } catch (e) {
    o.status = "failed";
    o.lastError = e instanceof Error ? e.message : String(e);
    console.error("dispatch failed", o.id, o.lastError);
  }
  return o;
}
