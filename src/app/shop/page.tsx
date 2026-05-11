import { AddressDeliveryEstimate } from "@/components/shop/address-delivery-estimate";
import { ShopGrid } from "@/components/shop/shop-grid";

export default function ShopPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
            Shop landscape materials
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-emerald-950 sm:text-5xl">
            Browse mulch, stone, sand, and soil.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-950/65">
            Add materials to your cart and use the delivery estimate to get a
            quick mock quote for Metro Detroit delivery.
          </p>
        </div>
        <div className="mt-6">
          <AddressDeliveryEstimate />
        </div>
      </div>
      <ShopGrid />
    </div>
  );
}
