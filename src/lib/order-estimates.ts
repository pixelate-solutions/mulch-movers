import { products } from "@/lib/products";

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

const prepLevelHours: Record<PrepLevel, number> = {
  ready: 0,
  light: 2,
  moderate: 3,
  heavy: 4,
};

const prepLevelPricing: Record<PrepLevel, number> = {
  ready: 0,
  light: 145,
  moderate: 240,
  heavy: 340,
};

export const scheduleDays = [
  { date: "2026-05-23", label: "Sat, May 23", openHours: 4, windows: ["8-11 AM", "12-3 PM"] },
  { date: "2026-05-25", label: "Mon, May 25", openHours: 6, windows: ["9-12 PM", "1-4 PM"] },
  { date: "2026-05-26", label: "Tue, May 26", openHours: 3, windows: ["10-1 PM"] },
  { date: "2026-05-27", label: "Wed, May 27", openHours: 7, windows: ["8-11 AM", "12-3 PM", "3-5 PM"] },
  { date: "2026-05-28", label: "Thu, May 28", openHours: 5, windows: ["9-12 PM", "1-4 PM"] },
  { date: "2026-05-29", label: "Fri, May 29", openHours: 2, windows: ["8-11 AM"] },
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
    services.includes("mulchInstall") && family === "mulch"
      ? Math.max(1, quantity * 0.75)
      : 0;
  const prepHours =
    services.includes("sitePrep") || prepLevel !== "ready"
      ? prepLevelHours[prepLevel]
      : 0;
  const debrisHours = services.includes("debrisHaulAway")
    ? Math.max(1, debrisQuantity * 0.75)
    : 0;

  return Math.ceil(deliveryHours + installHours + prepHours + debrisHours);
}

export function estimateOrder({
  address,
  productId,
  quantity,
  family,
  services,
  prepLevel,
  debrisQuantity,
}: {
  address: string;
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
  const deliveryFee = address.trim() ? 45 + Math.max(0, safeQuantity - 1) * 8 : 0;
  const materialSubtotal = family === "debris" ? 0 : product.startingPrice * safeQuantity;
  const installSubtotal =
    services.includes("mulchInstall") && family === "mulch"
      ? safeQuantity * 72
      : 0;
  const prepSubtotal =
    services.includes("sitePrep") || prepLevel !== "ready"
      ? prepLevelPricing[prepLevel]
      : 0;
  const debrisSubtotal = services.includes("debrisHaulAway")
    ? 60 + safeDebrisQuantity * 90
    : 0;
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
