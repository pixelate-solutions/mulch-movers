import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
          Secure checkout
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
          Confirm delivery, payment, and order details.
        </h1>
      </div>
      <CheckoutFlow />
    </div>
  );
}
