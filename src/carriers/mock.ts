import type { Carrier, Letter, SendOptions, SendResult, StatusResult } from "../types.js";

/** Simuliert einen Carrier – kein Versand, Status wandert zeitgesteuert. */
export class MockCarrier implements Carrier {
  readonly name = "mock";
  private sentAt = new Map<string, number>();

  async send(letter: Letter, _opts: SendOptions): Promise<SendResult> {
    const ref = "mock_" + letter.id.slice(4);
    this.sentAt.set(ref, Date.now());
    return { carrierRef: ref, carrierStatus: "accepted" };
  }

  async status(carrierRef: string): Promise<StatusResult> {
    const t = this.sentAt.get(carrierRef);
    if (!t) return { carrierStatus: "unknown", status: "failed" };
    const age = Date.now() - t;
    if (age < 10_000) return { carrierStatus: "accepted", status: "queued" };
    if (age < 30_000) return { carrierStatus: "printed", status: "sent" };
    return { carrierStatus: "delivered", status: "delivered", deliveredAt: new Date(t + 30_000).toISOString() };
  }

  estimatePrice(pages: number, opts: SendOptions, country: string): number {
    const base = country === "DE" ? 0.86 : 1.4;
    const sheets = opts.duplex ? Math.ceil(pages / 2) : pages;
    return +(base + Math.max(0, sheets - 1) * 0.1 + (opts.color ? 0.1 * pages : 0)).toFixed(2);
  }
}
