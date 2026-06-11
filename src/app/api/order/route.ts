import {
  buildCheckoutOrder,
  buildStripeOrderMetadata,
  CheckoutOrderError,
  parseCheckoutOrderInput,
} from "@/lib/checkout-order";
import { getStripe } from "@/lib/stripe";

function getSiteOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const input = parseCheckoutOrderInput(body);

  try {
    const order = buildCheckoutOrder(input);
    const stripe = getStripe();
    const origin = getSiteOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      client_reference_id: `${order.email}:${Date.now()}`,
      line_items: order.lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: item.unitAmountCents,
        },
      })),
      metadata: buildStripeOrderMetadata(input),
      payment_intent_data: {
        metadata: buildStripeOrderMetadata(input),
      },
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
    });

    if (!session.url) {
      return Response.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof CheckoutOrderError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unable to start Stripe checkout.";

    return Response.json({ error: message }, { status: 500 });
  }
}
