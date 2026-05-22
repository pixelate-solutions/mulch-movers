import { CartPage } from "@/components/shop/cart-page";

export default function CartRoutePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
          Cart and delivery estimate
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
          Review your materials.
        </h1>
        <p className="mt-4 text-base leading-7 text-emerald-950/65">
          Adjust quantities, remove items, and review selected services before
          checkout collects delivery, scheduling, and payment details.
        </p>
      </div>
      <CartPage />
    </div>
  );
}
