import type { GeocodedAddress } from "@/lib/delivery";
import type { PrepLevel, ServiceKey } from "@/lib/order-estimates";

export type Supplier = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type DeliveryZone = {
  zone: 1 | 2 | 3;
  minMiles: number;
  maxMiles: number;
  fee: number;
  smallCapSurcharge: number;
  prepPricePerYard: Record<Exclude<PrepLevel, "ready">, number>;
};

export type SupplierRecommendation = Supplier & {
  assignedByZip: boolean;
  distanceMiles?: number;
};

export const serviceableDeliveryMessage =
  "This address is outside the current Mulch Movers delivery ZIP codes.";

export const suppliers: Supplier[] = [
  {
    id: "mains-landscape-supply",
    name: "Mains Landscape Supply",
    address: "21355 Telegraph Rd, Southfield, MI 48033",
    latitude: 42.4489,
    longitude: -83.2798,
  },
  {
    id: "mains-mulch-express",
    name: "Mains Mulch Express",
    address: "1835 S Rochester Rd, Rochester Hills, MI 48307",
    latitude: 42.6687,
    longitude: -83.1435,
  },
  {
    id: "auburn-oaks-nursery",
    name: "Auburn Oaks Nursery",
    address: "3820 W Auburn Rd, Rochester Hills, MI 48309",
    latitude: 42.6344,
    longitude: -83.2071,
  },
  {
    id: "state-crushing-auburn-hills",
    name: "State Crushing Auburn Hills",
    address: "2260 Auburn Rd, Auburn Hills, MI 48326",
    latitude: 42.6875,
    longitude: -83.2341,
  },
  {
    id: "advanced-landscape-supply",
    name: "Advanced Landscape Supply",
    address: "890 Rochester Rd, Clawson, MI 48017",
    latitude: 42.5423,
    longitude: -83.1339,
  },
  {
    id: "haley-stone-rochester",
    name: "Haley Stone Rochester",
    address: "3975 S Rochester Rd, Rochester Hills, MI 48307",
    latitude: 42.5792,
    longitude: -83.1329,
  },
  {
    id: "american-mulch-producers",
    name: "American Mulch Producers",
    address: "19400 Eight Mile W, Southfield, MI 48075",
    latitude: 42.4449,
    longitude: -83.2206,
  },
];

const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

export const serviceAreaZipCodes: Record<string, string | null> = {
  "48084": "mains-landscape-supply",
  "48009": "mains-mulch-express",
  "48017": "auburn-oaks-nursery",
  "48098": "state-crushing-auburn-hills",
  "48072": "advanced-landscape-supply",
  "48067": "haley-stone-rochester",
  "48025": "american-mulch-producers",
  "48304": null,
};

export const deliveryZones: DeliveryZone[] = [
  {
    zone: 1,
    minMiles: 0,
    maxMiles: 5,
    fee: 40,
    smallCapSurcharge: 25,
    prepPricePerYard: { light: 125, moderate: 135, heavy: 145 },
  },
  {
    zone: 2,
    minMiles: 5.01,
    maxMiles: 10,
    fee: 60,
    smallCapSurcharge: 45,
    prepPricePerYard: { light: 135, moderate: 145, heavy: 155 },
  },
  {
    zone: 3,
    minMiles: 10.01,
    maxMiles: 15,
    fee: 80,
    smallCapSurcharge: 65,
    prepPricePerYard: { light: 145, moderate: 155, heavy: 165 },
  },
];

const debrisHaulAwayFee = 73;

export function normalizeZipCode(value: string | undefined) {
  return value?.match(/\d{5}/)?.[0] ?? "";
}

export function getAddressZipCode(address: GeocodedAddress | null) {
  return normalizeZipCode(address?.postcode) || normalizeZipCode(address?.label);
}

export function isServiceableAddress(address: GeocodedAddress | null) {
  const zipCode = getAddressZipCode(address);
  return Boolean(zipCode && zipCode in serviceAreaZipCodes);
}

export function getDistanceMiles(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 *
    earthRadiusMiles *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function getClosestSupplier(address: GeocodedAddress) {
  if (!address.latitude || !address.longitude) {
    return null;
  }

  return suppliers
    .map((supplier) => ({
      ...supplier,
      assignedByZip: false,
      distanceMiles: getDistanceMiles(supplier, {
        latitude: address.latitude as number,
        longitude: address.longitude as number,
      }),
    }))
    .sort((first, second) => first.distanceMiles - second.distanceMiles)[0];
}

export function getSupplierRecommendation(
  address: GeocodedAddress,
): SupplierRecommendation | null {
  const zipCode = getAddressZipCode(address);
  const assignedSupplierId = serviceAreaZipCodes[zipCode];
  const assignedSupplier = assignedSupplierId
    ? supplierById.get(assignedSupplierId)
    : null;

  if (assignedSupplier) {
    return {
      ...assignedSupplier,
      assignedByZip: true,
      distanceMiles:
        address.latitude && address.longitude
          ? getDistanceMiles(assignedSupplier, {
              latitude: address.latitude,
              longitude: address.longitude,
            })
          : undefined,
    };
  }

  return getClosestSupplier(address);
}

export function getDeliveryZone(distanceMiles: number | undefined) {
  if (typeof distanceMiles !== "number" || !Number.isFinite(distanceMiles)) {
    return deliveryZones[deliveryZones.length - 1];
  }

  return (
    deliveryZones.find(
      (zone) =>
        distanceMiles >= zone.minMiles && distanceMiles <= zone.maxMiles,
    ) ?? null
  );
}

export function calculateDeliveryPricing(address: GeocodedAddress) {
  const supplier = getSupplierRecommendation(address);
  const zone = getDeliveryZone(supplier?.distanceMiles);

  return {
    fee: zone?.fee ?? 0,
    zone,
    supplier,
    distanceMiles: supplier?.distanceMiles,
    window:
      zone?.zone === 1
        ? "Next available morning"
        : zone?.zone === 2
          ? "2 business days"
          : "Next available afternoon",
  };
}

export function calculateAddOnPricing({
  deliveryZone,
  prepLevel,
  quantity,
  services,
}: {
  deliveryZone: DeliveryZone | null | undefined;
  prepLevel: PrepLevel;
  quantity: number;
  services: ServiceKey[];
}) {
  const lineItems: {
    key: string;
    label: string;
    description?: string;
    total: number;
  }[] = [];
  const needsInstallOrPrep =
    services.includes("mulchInstall") || services.includes("sitePrep");
  const matrixPrepLevel: Exclude<PrepLevel, "ready"> =
    prepLevel === "ready" ? "light" : prepLevel;

  if (needsInstallOrPrep && deliveryZone) {
    const smallCapSurcharge =
      quantity < 2 ? deliveryZone.smallCapSurcharge : 0;
    const unitPrice =
      deliveryZone.prepPricePerYard[matrixPrepLevel] + smallCapSurcharge;
    const label =
      services.includes("mulchInstall") && services.includes("sitePrep")
        ? "Installation & site preparation"
        : services.includes("sitePrep")
          ? "Site preparation"
          : "Installation";

    lineItems.push({
      key: "installPrep",
      label,
      description: `${matrixPrepLevel[0].toUpperCase()}${matrixPrepLevel.slice(1)} prep, zone ${deliveryZone.zone}`,
      total: unitPrice * quantity,
    });
  }

  if (services.includes("debrisHaulAway")) {
    lineItems.push({
      key: "debrisHaulAway",
      label: "Debris cleanout",
      description: "Removal of shrubs, sticks, leaves, branches, or old material.",
      total: debrisHaulAwayFee,
    });
  }

  return {
    lineItems,
    total: lineItems.reduce((sum, item) => sum + item.total, 0),
  };
}
