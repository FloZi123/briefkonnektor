import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder, updateOrder } from "@/lib/orders";
import { renderDraft } from "@/lib/letter";
import { PRICES, euro, type Draft } from "@/lib/types";

export const runtime = "nodejs";

const base = () => process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export async function POST(req: Request) {
  const { draft } = (await req.json()) as { draft: Draft };
  if (!draft?.body || !draft.email || !draft.recipient?.name) return NextResponse.json({ error: "Entwurf unvollständig" }, { status: 400 });
  const price = PRICES[draft.shipping] ?? PRICES.post;

  // PDF sofort rendern und an der Bestellung speichern – so ist es nach der Zahlung ohne Browser da
  const { pdf } = await renderDraft(draft);
  const order = await createOrder(draft, price.cents, euro(price.cents));
  order.pdf = pdf;

  // Ohne Stripe-Key (lokal/Preview): Zahlung simulieren
  if (!process.env.STRIPE_SECRET_KEY) {
    order.status = "paid";
    await updateOrder(order);
    const { dispatchOrder } = await import("@/lib/letter");
    await updateOrder(await dispatchOrder(order));
    return NextResponse.json({ url: `${base()}/brief/fertig?order=${order.id}`, simulated: true });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: draft.email,
    locale: "de",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: price.cents,
          product_data: { name: `Flinkbrief – ${price.label}`, description: `${order.subject} an ${order.recipientName}` },
        },
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${base()}/brief/fertig?order=${order.id}`,
    cancel_url: `${base()}/brief/versand`,
    // Widerrufsrecht erlischt mit Ausführungsbeginn (§ 312g BGB) – Zustimmung im Checkout
    consent_collection: { terms_of_service: "required" },
    custom_text: { terms_of_service_acceptance: { message: "Ich stimme zu, dass Flinkbrief sofort mit der Ausführung beginnt, und weiß, dass mein Widerrufsrecht damit erlischt." } },
  });
  order.stripeSessionId = session.id;
  await updateOrder(order);
  return NextResponse.json({ url: session.url });
}
