import Stripe from "stripe";
import { getOrder, updateOrder, type Order } from "./orders";
import { dispatchOrder } from "./letter";
import { sendOrderConfirmation, sendStatusMail } from "./mail";

/** Bezahlte Bestellung abschließen: Versand anstoßen, Mails senden. Idempotent – läuft nur bei status "pending". */
export async function finalizePaidOrder(o: Order): Promise<Order> {
  if (o.status !== "pending") return o;
  const full = o.pdf ? o : await getOrder(o.id, { withPdf: true });
  if (!full) return o;
  full.status = "paid";
  const done = await updateOrder(await dispatchOrder(full));
  await sendOrderConfirmation(done);
  if (done.status === "failed") await sendStatusMail(done, "failed");
  return done;
}

/**
 * Sicherheitsnetz ohne Webhook: Wenn eine Bestellung noch "pending" ist, direkt bei Stripe nachsehen,
 * ob die Checkout-Session bezahlt wurde (z. B. beim Aufruf der Bestätigungsseite).
 */
export async function reconcileWithStripe(o: Order): Promise<Order> {
  if (o.status !== "pending" || !o.stripeSessionId || !process.env.STRIPE_SECRET_KEY) return o;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(o.stripeSessionId);
    if (session.payment_status === "paid") return finalizePaidOrder(o);
  } catch (e) {
    console.error("stripe reconcile failed", o.id, e);
  }
  return o;
}
