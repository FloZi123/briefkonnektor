import type { Carrier } from "../types";
import { MockCarrier } from "./mock";
import { PingenCarrier } from "./pingen";

let instance: Carrier | undefined;

export function getCarrier(): Carrier {
  if (instance) return instance;
  const which = (process.env.CARRIER ?? "mock").toLowerCase();
  if (which === "pingen") {
    const { PINGEN_CLIENT_ID, PINGEN_CLIENT_SECRET, PINGEN_ORGANISATION_ID, PINGEN_ENV, PINGEN_SCOPE, PINGEN_WEBHOOK_SIGNING_KEY } =
      process.env;
    if (!PINGEN_CLIENT_ID || !PINGEN_CLIENT_SECRET || !PINGEN_ORGANISATION_ID) {
      throw new Error("CARRIER=pingen, aber PINGEN_CLIENT_ID / PINGEN_CLIENT_SECRET / PINGEN_ORGANISATION_ID fehlen");
    }
    instance = new PingenCarrier({
      clientId: PINGEN_CLIENT_ID,
      clientSecret: PINGEN_CLIENT_SECRET,
      organisationId: PINGEN_ORGANISATION_ID,
      env: PINGEN_ENV === "production" ? "production" : "staging",
      scope: PINGEN_SCOPE || undefined,
      webhookSigningKey: PINGEN_WEBHOOK_SIGNING_KEY || undefined,
    });
  } else {
    instance = new MockCarrier();
  }
  return instance;
}
