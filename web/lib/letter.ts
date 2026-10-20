import { renderLetter } from "@core/letter/render";
import { getCarrier } from "@core/carriers/index";
import { PingenCarrier } from "@core/carriers/pingen";
import type { Letter as CoreLetter } from "@core/types";
import { subjectLine } from "./subject";
import { today } from "./dates";
import type { Draft } from "./types";
import type { Order } from "./orders";

/** DIN-5008-PDF aus dem Entwurf, inkl. Unterschrift. */
export async function renderDraft(d: Draft): Promise<{ pdf: Uint8Array; pages: number }> {
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
    // Einschreiben: Pingen-Produktcode noch zu verifizieren – bis dahin "cheap" + Hinweis im Log
    if (o.shipping === "registered" && carrier instanceof PingenCarrier) console.warn("registered mail requested – delivery_product for Einschreiben not yet mapped, sending as standard");
    const r = await carrier.send(letter, { color: false, duplex: false });
    o.carrierRef = r.carrierRef;
    o.status = "queued";
  } catch (e) {
    o.status = "failed";
    o.lastError = e instanceof Error ? e.message : String(e);
    console.error("dispatch failed", o.id, o.lastError);
  }
  return o;
}
