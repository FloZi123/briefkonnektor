import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrder, findByStripeSession, updateOrder } from "@/lib/orders";
import { dispatchOrder } from "@/lib/letter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const stripe = new Stripe(key);
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", secret);
  } catch (e) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order =
      (session.metadata?.orderId && (await getOrder(session.metadata.orderId, { withPdf: true }))) ||
      (await findByStripeSession(session.id, { withPdf: true }));
    if (order && order.status === "pending") {
      order.status = "paid";
      await updateOrder(await dispatchOrder(order));
    }
  }
  return NextResponse.json({ received: true });
}
