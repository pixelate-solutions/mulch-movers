import Stripe from "stripe";
import { headers } from "next/headers";

import {
  buildCheckoutOrder,
  parseCheckoutOrderInputFromMetadata,
} from "@/lib/checkout-order";
import { sendPaidOrderEmails } from "@/lib/order-email";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid Stripe webhook.";

    return Response.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const input = parseCheckoutOrderInputFromMetadata(session.metadata);
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
      const order = buildCheckoutOrder(input, {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        stripePaymentStatus: session.payment_status,
      });

      await sendPaidOrderEmails(order);
    }
  }

  return Response.json({ received: true });
}
