import {
  calculateSelectedAddressDelivery,
  type GeocodedAddress,
} from "@/lib/delivery";
import { scheduleDays, serviceOptions, type PrepLevel, type ServiceKey } from "@/lib/order-estimates";
import {
  calculateAddOnPricing,
  isServiceableAddress,
  serviceableDeliveryMessage,
  type SupplierRecommendation,
} from "@/lib/pricing";
import { getCategoryLimit, getProduct } from "@/lib/products";
import { isValidUsPhone } from "@/lib/phone";
import type { Product } from "@/types/product";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const checkoutServiceKeys = new Set<ServiceKey>(
  serviceOptions
    .map((option) => option.key)
    .filter((key) => key !== "delivery"),
);

export type CheckoutOrderInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: GeocodedAddress;
  deliveryDate: string;
  deliveryWindow: string;
  dropOffNotes: string;
  items: { productId: string; quantity: number }[];
  services: ServiceKey[];
  prepLevel: PrepLevel | "";
};

export type CheckoutLineItem = {
  name: string;
  description?: string;
  quantity: number;
  unitAmountCents: number;
  totalAmountCents: number;
  kind: "material" | "delivery" | "service";
};

export type PaidOrder = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  deliveryDate: string;
  deliveryWindow: string;
  dropOffNotes: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  services: string[];
  lineItems: CheckoutLineItem[];
  materialSubtotal: number;
  deliveryFee: number;
  serviceTotal: number;
  total: number;
  totalCents: number;
  supplier: SupplierRecommendation | null;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripePaymentStatus?: string;
};

export class CheckoutOrderError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutOrderError";
    this.status = status;
  }
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function fromCents(value: number) {
  return value / 100;
}

function parseCoordinate(value: string | undefined) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function normalizeServices(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((service): service is ServiceKey =>
    checkoutServiceKeys.has(service as ServiceKey),
  );
}

function normalizePrepLevel(value: unknown): PrepLevel | "" {
  return value === "light" || value === "moderate" || value === "heavy"
    ? value
    : "";
}

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const record = item as Record<string, unknown>;

    return {
      productId: normalizeString(record.productId),
      quantity: Number(record.quantity),
    };
  });
}

export function parseCheckoutOrderInput(value: unknown): CheckoutOrderInput {
  const body = (value ?? {}) as Record<string, unknown>;
  const rawAddress = (body.address ?? {}) as Record<string, unknown>;
  const services = normalizeServices(body.services);
  const prepLevel = normalizePrepLevel(body.prepLevel);

  return {
    firstName: normalizeString(body.firstName),
    lastName: normalizeString(body.lastName),
    email: normalizeString(body.email).toLowerCase(),
    phone: normalizeString(body.phone),
    address: {
      id: normalizeString(rawAddress.id),
      label: normalizeString(rawAddress.label),
      county: normalizeString(rawAddress.county),
      state: normalizeString(rawAddress.state),
      postcode: normalizeString(rawAddress.postcode),
      latitude: Number(rawAddress.latitude) || undefined,
      longitude: Number(rawAddress.longitude) || undefined,
    },
    deliveryDate: normalizeString(body.deliveryDate),
    deliveryWindow: normalizeString(body.deliveryWindow),
    dropOffNotes: normalizeString(body.dropOffNotes).slice(0, 1000),
    items: normalizeItems(body.items),
    services,
    prepLevel: services.includes("sitePrep") ? prepLevel : "",
  };
}

function getProductLines(inputItems: CheckoutOrderInput["items"]) {
  const categoryQuantities = new Map<Product["category"], number>();

  if (inputItems.length === 0) {
    throw new CheckoutOrderError("Add at least one product to checkout.");
  }

  return inputItems.map((item) => {
    const product = getProduct(item.productId);

    if (!product) {
      throw new CheckoutOrderError("One of the selected products is no longer available.");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new CheckoutOrderError(`Choose a valid quantity for ${product.name}.`);
    }

    const nextCategoryQuantity =
      (categoryQuantities.get(product.category) ?? 0) + item.quantity;

    if (nextCategoryQuantity > getCategoryLimit(product.category)) {
      throw new CheckoutOrderError(
        `${product.category} orders are limited to ${getCategoryLimit(product.category)} cubic yards online.`,
      );
    }

    categoryQuantities.set(product.category, nextCategoryQuantity);

    return {
      product,
      quantity: item.quantity,
    };
  });
}

function validateSchedule(deliveryDate: string, deliveryWindow: string) {
  const selectedDay = scheduleDays.find((day) => day.date === deliveryDate);

  if (!selectedDay) {
    throw new CheckoutOrderError("Choose an available delivery date.");
  }

  if (!selectedDay.windows.includes(deliveryWindow)) {
    throw new CheckoutOrderError("Choose an available delivery window.");
  }
}

function getServiceLineItems({
  delivery,
  services,
  prepLevel,
  quantity,
}: {
  delivery: ReturnType<typeof calculateSelectedAddressDelivery>;
  services: ServiceKey[];
  prepLevel: PrepLevel;
  quantity: number;
}) {
  const addOns = calculateAddOnPricing({
    deliveryZone: delivery.zone,
    prepLevel,
    quantity,
    services,
  });

  return addOns.lineItems.map<CheckoutLineItem>((lineItem) => {
    const subtotalCents = toCents(lineItem.total);

    return {
      kind: "service",
      name: lineItem.label,
      description: lineItem.description,
      quantity: 1,
      unitAmountCents: subtotalCents,
      totalAmountCents: subtotalCents,
    };
  });
}

export function buildCheckoutOrder(
  input: CheckoutOrderInput,
  stripeDetails: Pick<
    PaidOrder,
    "stripeCheckoutSessionId" | "stripePaymentIntentId" | "stripePaymentStatus"
  > = {},
): PaidOrder {
  if (!input.firstName || !input.lastName) {
    throw new CheckoutOrderError("Enter your first and last name.");
  }

  if (!emailPattern.test(input.email)) {
    throw new CheckoutOrderError("Enter a valid email address.");
  }

  if (!isValidUsPhone(input.phone)) {
    throw new CheckoutOrderError("Enter a valid 10-digit U.S. phone number.");
  }

  if (!input.address.label) {
    throw new CheckoutOrderError("Select one of the suggested delivery addresses first.");
  }

  if (!isServiceableAddress(input.address)) {
    throw new CheckoutOrderError(serviceableDeliveryMessage);
  }

  validateSchedule(input.deliveryDate, input.deliveryWindow);

  if (input.services.includes("sitePrep") && !input.prepLevel) {
    throw new CheckoutOrderError("Choose a site prep level.");
  }

  const productLines = getProductLines(input.items);
  const totalMaterialQuantity = productLines.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const delivery = calculateSelectedAddressDelivery(
    input.address,
    totalMaterialQuantity,
  );

  if (!delivery.zone) {
    throw new CheckoutOrderError(
      "This address is outside the current delivery mileage zones.",
    );
  }

  const materialLineItems = productLines.map<CheckoutLineItem>((item) => {
    const unitAmountCents = toCents(item.product.startingPrice);

    return {
      kind: "material",
      name: item.product.name,
      description: `${item.quantity} cubic yard${item.quantity === 1 ? "" : "s"}`,
      quantity: item.quantity,
      unitAmountCents,
      totalAmountCents: unitAmountCents * item.quantity,
    };
  });
  const serviceLineItems = getServiceLineItems({
    delivery,
    services: input.services,
    prepLevel: input.prepLevel || "ready",
    quantity: totalMaterialQuantity,
  });
  const deliveryFeeCents = toCents(delivery.fee);
  const deliveryLineItem: CheckoutLineItem = {
    kind: "delivery",
    name: "Delivery",
    description:
      typeof delivery.distanceMiles === "number"
        ? `Zone ${delivery.zone.zone} - ${delivery.distanceMiles.toFixed(1)} miles from ${delivery.supplier?.name ?? "supplier"}`
        : "Delivery fee",
    quantity: 1,
    unitAmountCents: deliveryFeeCents,
    totalAmountCents: deliveryFeeCents,
  };
  const lineItems = [
    ...materialLineItems,
    deliveryLineItem,
    ...serviceLineItems,
  ];
  const materialSubtotalCents = materialLineItems.reduce(
    (total, item) => total + item.totalAmountCents,
    0,
  );
  const serviceTotalCents = serviceLineItems.reduce(
    (total, item) => total + item.totalAmountCents,
    0,
  );
  const totalCents = lineItems.reduce(
    (total, item) => total + item.totalAmountCents,
    0,
  );

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    address: input.address.label,
    deliveryDate: input.deliveryDate,
    deliveryWindow: input.deliveryWindow,
    dropOffNotes: input.dropOffNotes,
    items: productLines.map((item) => {
      const unitPriceCents = toCents(item.product.startingPrice);

      return {
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: fromCents(unitPriceCents),
        total: fromCents(unitPriceCents * item.quantity),
      };
    }),
    services: input.services
      .map((key) => serviceOptions.find((option) => option.key === key)?.label)
      .filter(Boolean) as string[],
    lineItems,
    materialSubtotal: fromCents(materialSubtotalCents),
    deliveryFee: fromCents(deliveryFeeCents),
    serviceTotal: fromCents(serviceTotalCents),
    total: fromCents(totalCents),
    totalCents,
    supplier: delivery.supplier,
    ...stripeDetails,
  };
}

export function buildStripeOrderMetadata(input: CheckoutOrderInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    addressId: input.address.id,
    addressLabel: input.address.label,
    addressCounty: input.address.county ?? "",
    addressState: input.address.state ?? "",
    addressPostcode: input.address.postcode ?? "",
    addressLatitude: String(input.address.latitude ?? ""),
    addressLongitude: String(input.address.longitude ?? ""),
    deliveryDate: input.deliveryDate,
    deliveryWindow: input.deliveryWindow,
    dropOffNotes: input.dropOffNotes.slice(0, 500),
    items: input.items.map((item) => `${item.productId}:${item.quantity}`).join("|"),
    services: input.services.join("|"),
    prepLevel: input.prepLevel,
  };
}

export function parseCheckoutOrderInputFromMetadata(
  metadata: Record<string, string> | null | undefined,
): CheckoutOrderInput {
  const values = metadata ?? {};
  const services = values.services
    ? values.services.split("|").filter((service): service is ServiceKey =>
        checkoutServiceKeys.has(service as ServiceKey),
      )
    : [];
  const prepLevel = normalizePrepLevel(values.prepLevel);

  return {
    firstName: values.firstName ?? "",
    lastName: values.lastName ?? "",
    email: values.email ?? "",
    phone: values.phone ?? "",
    address: {
      id: values.addressId ?? "",
      label: values.addressLabel ?? "",
      county: values.addressCounty ?? "",
      state: values.addressState ?? "",
      postcode: values.addressPostcode ?? "",
      latitude: parseCoordinate(values.addressLatitude),
      longitude: parseCoordinate(values.addressLongitude),
    },
    deliveryDate: values.deliveryDate ?? "",
    deliveryWindow: values.deliveryWindow ?? "",
    dropOffNotes: values.dropOffNotes ?? "",
    items: values.items
      ? values.items.split("|").map((item) => {
          const [productId, quantity] = item.split(":");

          return {
            productId,
            quantity: Number(quantity),
          };
        })
      : [],
    services,
    prepLevel: services.includes("sitePrep") ? prepLevel : "",
  };
}
