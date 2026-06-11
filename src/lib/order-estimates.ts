import { products } from "@/lib/products";
import {
  calculateAddOnPricing,
  calculateDeliveryPricing,
} from "@/lib/pricing";
import type { GeocodedAddress } from "@/lib/delivery";

export type ProjectMode = "ready" | "guidance";
export type MaterialFamily = "mulch" | "soil" | "sand" | "stone" | "debris";
export type PrepLevel = "ready" | "light" | "moderate" | "heavy";
export type ServiceKey =
  | "delivery"
  | "mulchInstall"
  | "sitePrep"
  | "debrisHaulAway";

export type CartProjectConfiguration = {
  address: string;
  desiredDate: string;
  materialFamily: MaterialFamily;
  productId: string;
  quantity: number;
  debrisQuantity: number;
  services: ServiceKey[];
  prepLevel: PrepLevel;
  notes: string;
};

export const materialCaps: Record<MaterialFamily, number> = {
  mulch: 5,
  soil: 2,
  sand: 2,
  stone: 2,
  debris: 2,
};

export const serviceOptions: {
  key: ServiceKey;
  label: string;
  description: string;
}[] = [
  {
    key: "delivery",
    label: "Delivery",
    description: "Material sourcing and driveway drop-off. Included with every order.",
  },
  {
    key: "mulchInstall",
    label: "Installation",
    description: "We spread the material at your project site.",
  },
  {
    key: "sitePrep",
    label: "Site preparation",
    description: "Edging, weeding, trimming, and cleanup before install.",
  },
  {
    key: "debrisHaulAway",
    label: "Debris cleanout",
    description: "Removal of shrubs, sticks, leaves, branches, or old material.",
  },
];

const prepLevelLaborUnitsPerYard: Record<PrepLevel, number> = {
  ready: 0,
  light: 0.5,
  moderate: 0.75,
  heavy: 1,
};

export const scheduleDays = [
  { date: "2026-06-08", label: "Mon, Jun 8", openHours: 6, windows: ["9-12 PM", "1-4 PM"] },
  { date: "2026-06-09", label: "Tue, Jun 9", openHours: 3, windows: ["10-1 PM"] },
  { date: "2026-06-10", label: "Wed, Jun 10", openHours: 7, windows: ["8-11 AM", "12-3 PM", "3-5 PM"] },
  { date: "2026-06-11", label: "Thu, Jun 11", openHours: 5, windows: ["9-12 PM", "1-4 PM"] },
  { date: "2026-06-12", label: "Fri, Jun 12", openHours: 2, windows: ["8-11 AM"] },
  { date: "2026-06-13", label: "Sat, Jun 13", openHours: 4, windows: ["8-11 AM", "12-3 PM"] },
];

export function getMaterialFamily(productId: string): MaterialFamily {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return "mulch";
  }

  return product.category.toLowerCase() as MaterialFamily;
}

export function clampMaterialQuantity(
  family: MaterialFamily,
  quantity: number,
) {
  return Math.min(Math.max(quantity, 0), materialCaps[family]);
}

export function getProjectHours({
  family,
  quantity,
  services,
  prepLevel,
  debrisQuantity,
}: {
  family: MaterialFamily;
  quantity: number;
  services: ServiceKey[];
  prepLevel: PrepLevel;
  debrisQuantity: number;
}) {
  const deliveryHours = 1;
  const installHours =
    services.includes("mulchInstall") && family !== "debris" ? quantity : 0;
  const prepHours =
    services.includes("sitePrep") || prepLevel !== "ready"
      ? quantity * prepLevelLaborUnitsPerYard[prepLevel]
      : 0;
  const debrisHours = services.includes("debrisHaulAway")
    ? Math.max(1, debrisQuantity)
    : 0;

  return Math.ceil(deliveryHours + installHours + prepHours + debrisHours);
}

export function estimateOrder({
  address,
  deliveryAddress,
  productId,
  quantity,
  family,
  services,
  prepLevel,
  debrisQuantity,
}: {
  address: string;
  deliveryAddress?: GeocodedAddress | null;
  productId: string;
  quantity: number;
  family: MaterialFamily;
  services: ServiceKey[];
  prepLevel: PrepLevel;
  debrisQuantity: number;
}) {
  const product = products.find((item) => item.id === productId) ?? products[0];
  const safeQuantity = clampMaterialQuantity(family, quantity);
  const safeDebrisQuantity = clampMaterialQuantity("debris", debrisQuantity);
  const delivery = deliveryAddress
    ? calculateDeliveryPricing(deliveryAddress)
    : null;
  const deliveryFee = delivery?.fee ?? (address.trim() ? 0 : 0);
  const materialSubtotal = family === "debris" ? 0 : product.startingPrice * safeQuantity;
  const addOns = calculateAddOnPricing({
    deliveryZone: delivery?.zone,
    prepLevel,
    quantity: safeQuantity,
    services,
  });
  const installPrepLine = addOns.lineItems.find(
    (lineItem) => lineItem.key === "installPrep",
  );
  const installSubtotal = services.includes("mulchInstall")
    ? installPrepLine?.total ?? 0
    : 0;
  const prepSubtotal =
    !services.includes("mulchInstall") && services.includes("sitePrep")
      ? installPrepLine?.total ?? 0
      : 0;
  const debrisSubtotal =
    addOns.lineItems.find((lineItem) => lineItem.key === "debrisHaulAway")
      ?.total ?? 0;
  const projectHours = getProjectHours({
    family,
    quantity: safeQuantity,
    services,
    prepLevel,
    debrisQuantity: safeDebrisQuantity,
  });

  return {
    product,
    quantity: safeQuantity,
    debrisQuantity: safeDebrisQuantity,
    deliveryFee,
    materialSubtotal,
    installSubtotal,
    prepSubtotal,
    debrisSubtotal,
    projectHours,
    total:
      deliveryFee +
      materialSubtotal +
      installSubtotal +
      prepSubtotal +
      debrisSubtotal,
  };
}
