"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  ClipboardCheck,
  MapPin,
  ShoppingCart,
} from "lucide-react";

import { useCart } from "@/components/shop/cart-provider";
import { AddressAutocomplete } from "@/components/shop/address-autocomplete";
import { GlassCard } from "@/components/site/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  isOaklandCountyAddress,
  oaklandCountyDeliveryMessage,
  type GeocodedAddress,
} from "@/lib/delivery";
import { formatDisplayDate, localDateValue } from "@/lib/dates";
import {
  clampMaterialQuantity,
  estimateOrder,
  materialCaps,
  serviceOptions,
  type MaterialFamily,
  type PrepLevel,
  type ServiceKey,
} from "@/lib/order-estimates";
import { shoppableProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

const materialOptions: {
  value: MaterialFamily;
  label: string;
  description: string;
}[] = [
  {
    value: "mulch",
    label: "Mulch",
    description: "Bed refresh, curb appeal, tree rings, and garden paths.",
  },
  {
    value: "debris",
    label: "Debris removal",
    description: "Shrubs, sticks, leaves, small branches, or old material.",
  },
];

const mulchUseCases = [
  {
    value: "natural",
    label: "I want natural",
    description: "Cedar or hardwood mulch.",
    productIds: ["natural-mulch", "cedar-mulch"],
  },
  {
    value: "decorative",
    label: "I want decorative",
    description: "Dyed red, black, or brown mulch.",
    productIds: ["brown-mulch", "black-mulch", "red-mulch"],
  },
  {
    value: "budget",
    label: "I want the cheapest option",
    description: "Arborist mulch.",
    productIds: ["arborist-mulch"],
  },
  {
    value: "slope",
    label: "The project area is on a slope",
    description: "Pine straw may be a better recommendation.",
    productIds: ["cedar-mulch"],
  },
];

const prepOptions: { value: PrepLevel; label: string; description: string }[] = [
  {
    value: "light",
    label: "Light prep",
    description: "Light weeding, edging, or trimming.",
  },
  {
    value: "moderate",
    label: "Moderate prep",
    description: "More involved weeding, edging, cleanup, or bed shaping.",
  },
  {
    value: "heavy",
    label: "Heavy prep",
    description: "Heavy weeding, brush cutting, debris, or old mulch removal.",
  },
];

const helpFlowStorageKey = "mulch-movers-help-flow";

type StoredHelpFlow = {
  step: number;
  address: GeocodedAddress | null;
  desiredDate: string;
  selectedMaterialFamilies: MaterialFamily[];
  productIds: string[];
  selectedMulchUseCases: string[];
  quantity: string;
  services: ServiceKey[];
  prepLevel: PrepLevel | "";
  added: boolean;
};

function parseNumber(value: string) {
  return Number(value) || 0;
}

function readStoredHelpFlow() {
  try {
    const storedDraft = window.localStorage.getItem(helpFlowStorageKey);

    if (!storedDraft) {
      return null;
    }

    return JSON.parse(storedDraft) as StoredHelpFlow;
  } catch {
    return null;
  }
}

export function HelpFlow() {
  const { addItem, deliveryAddress, setDeliveryAddress, setProjectConfig } =
    useCart();
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<GeocodedAddress | null>(null);
  const [desiredDate, setDesiredDate] = useState("");
  const [selectedMaterialFamilies, setSelectedMaterialFamilies] = useState<
    MaterialFamily[]
  >([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [selectedMulchUseCases, setSelectedMulchUseCases] = useState<string[]>(
    [],
  );
  const [quantity, setQuantity] = useState("");
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [prepLevel, setPrepLevel] = useState<PrepLevel | "">("");
  const [added, setAdded] = useState(false);
  const [stepError, setStepError] = useState("");
  const hasLoadedDraft = useRef(false);

  const visibleSteps = useMemo(
    () =>
      [
        "Project location",
        "Project timing",
        "Material need",
        selectedMaterialFamilies.includes("mulch") ? "Mulch guidance" : null,
        "Exact material",
        "Quantity",
        "Installation help",
        "Review",
      ].filter(Boolean) as string[],
    [selectedMaterialFamilies],
  );
  const currentStepIndex = Math.min(step, Math.max(visibleSteps.length - 1, 0));
  const currentStepName = visibleSteps[currentStepIndex];
  const materialFamily = selectedMaterialFamilies[0] ?? null;
  const shoppableMaterialFamilies = selectedMaterialFamilies.filter(
    (family) => family !== "debris",
  );
  const mulchGuidanceProductIds = useMemo(
    () =>
      new Set(
        selectedMulchUseCases.flatMap(
          (v) => mulchUseCases.find((u) => u.value === v)?.productIds ?? [],
        ),
      ),
    [selectedMulchUseCases],
  );

  const productOptions = shoppableProducts.filter((item) => {
    const category = item.category.toLowerCase() as MaterialFamily;
    if (!selectedMaterialFamilies.includes(category)) return false;
    if (category === "mulch" && mulchGuidanceProductIds.size > 0) {
      return mulchGuidanceProductIds.has(item.id);
    }
    return true;
  });
  const selectedProducts = productIds
    .map((id) => productOptions.find((p) => p.id === id))
    .filter(Boolean) as typeof productOptions;
  const product = selectedProducts[0] ?? null;
  const selectedFamily =
    (product?.category.toLowerCase() as MaterialFamily | undefined) ??
    materialFamily ??
    "mulch";
  const safeQuantity =
    product || materialFamily
      ? clampMaterialQuantity(selectedFamily, parseNumber(quantity))
      : 0;
  const activePrepLevel: PrepLevel =
    services.includes("sitePrep") && prepLevel ? prepLevel : "ready";
  const estimate = estimateOrder({
    address: address?.label ?? "",
    deliveryAddress: address,
    productId: product?.id ?? productOptions[0]?.id ?? "brown-mulch",
    quantity: safeQuantity,
    family: selectedFamily,
    services,
    prepLevel: activePrepLevel,
    debrisQuantity: materialFamily === "debris" ? safeQuantity : 0,
  });
  const serviceSubtotal =
    estimate.installSubtotal + estimate.prepSubtotal + estimate.debrisSubtotal;
  const selectedPrepOption = prepOptions.find(
    (option) => option.value === prepLevel,
  );
  const hasCountyBlockedAddress =
    Boolean(address) && !isOaklandCountyAddress(address);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      const storedDraft = readStoredHelpFlow();

      if (storedDraft) {
        setStep(storedDraft.step);
        setAddress(storedDraft.address);
        setDesiredDate(storedDraft.desiredDate);
        setSelectedMaterialFamilies(storedDraft.selectedMaterialFamilies);
        setProductIds(storedDraft.productIds);
        setSelectedMulchUseCases(storedDraft.selectedMulchUseCases);
        setQuantity(storedDraft.quantity);
        setServices(storedDraft.services);
        setPrepLevel(storedDraft.prepLevel);
        setAdded(storedDraft.added);
      }

      hasLoadedDraft.current = true;
    });
  }, []);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      if (deliveryAddress && deliveryAddress.id !== address?.id) {
        setAddress(deliveryAddress);
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [address?.id, deliveryAddress]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedDraft.current) {
      return;
    }

    const storedDraft: StoredHelpFlow = {
      step,
      address,
      desiredDate,
      selectedMaterialFamilies,
      productIds,
      selectedMulchUseCases,
      quantity,
      services,
      prepLevel,
      added,
    };

    window.localStorage.setItem(
      helpFlowStorageKey,
      JSON.stringify(storedDraft),
    );
  }, [
    added,
    address,
    desiredDate,
    prepLevel,
    productIds,
    quantity,
    selectedMaterialFamilies,
    selectedMulchUseCases,
    services,
    step,
  ]);

  function goNext() {
    const error = getStepError(currentStepName);

    if (error) {
      setStepError(error);
      return;
    }

    setStepError("");
    setStep(Math.min(currentStepIndex + 1, visibleSteps.length - 1));
  }

  function goBack() {
    setStep(Math.max(currentStepIndex - 1, 0));
  }

  function toggleMaterialFamily(family: MaterialFamily) {
    setSelectedMaterialFamilies((current) => {
      const next = current.includes(family)
        ? current.filter((item) => item !== family)
        : [...current, family];
      const nextPrimaryFamily = next.find((item) => item !== "debris");

      if (nextPrimaryFamily) {
        const nextProduct = shoppableProducts.find(
          (item) => item.category.toLowerCase() === nextPrimaryFamily,
        );

        if (nextProduct) {
          setProductIds([nextProduct.id]);
        }
      }

      if (!nextPrimaryFamily) {
        setProductIds([]);
      }

      if (quantity && nextPrimaryFamily) {
        setQuantity((currentQuantity) =>
          String(
            Math.ceil(
              clampMaterialQuantity(
                nextPrimaryFamily,
                parseNumber(currentQuantity),
              ),
            ),
          ),
        );
      }

      return next;
    });
  }

  function toggleMulchUseCase(useCase: (typeof mulchUseCases)[number]) {
    setSelectedMulchUseCases((current) => {
      const next = current.includes(useCase.value)
        ? current.filter((item) => item !== useCase.value)
        : [...current, useCase.value];

      setProductIds([]);
      return next;
    });
  }

  function updateQuantity(value: string) {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const parsedValue = Number(value);
    const cappedValue = Math.ceil(
      clampMaterialQuantity(selectedFamily, parsedValue),
    );

    setQuantity(value === "" ? "" : String(cappedValue));
  }

  function toggleService(service: ServiceKey) {
    setServices((current) => {
      const next = current.includes(service)
        ? current.filter((key) => key !== service)
        : [...current, service];

      if (service === "sitePrep" && current.includes(service)) {
        setPrepLevel("");
      }

      return next;
    });
  }

  function getStepError(currentStep: string) {
    if (currentStep === "Project location" && !address) {
      return "Select a suggested project address before continuing.";
    }
    if (currentStep === "Project location" && !isOaklandCountyAddress(address)) {
      return oaklandCountyDeliveryMessage;
    }
    if (currentStep === "Project timing" && !desiredDate) {
      return "Pick a project date before continuing.";
    }
    if (currentStep === "Material need") {
      if (selectedMaterialFamilies.length === 0) {
        return "Select at least one project need.";
      }
      if (shoppableMaterialFamilies.length === 0) {
        return "Select mulch so we can add a product to the cart.";
      }
    }
    if (
      currentStep === "Mulch guidance" &&
      selectedMulchUseCases.length === 0
    ) {
      return "Select at least one mulch guidance option.";
    }
    if (currentStep === "Exact material" && selectedProducts.length === 0) {
      return "Choose at least one material to add to the cart.";
    }
    if (currentStep === "Quantity" && safeQuantity < 1) {
      return "Enter a whole-yard quantity before continuing.";
    }
    if (currentStep === "Installation help" && services.length === 0) {
      return "Select at least one service option.";
    }
    if (
      currentStep === "Installation help" &&
      services.includes("sitePrep") &&
      !prepLevel
    ) {
      return "Select a site prep level.";
    }

    return "";
  }

  function addProductToCart() {
    const error =
      getStepError("Project location") ||
      getStepError("Project timing") ||
      getStepError("Material need") ||
      (selectedMaterialFamilies.includes("mulch")
        ? getStepError("Mulch guidance")
        : "") ||
      getStepError("Exact material") ||
      getStepError("Quantity") ||
      getStepError("Installation help");

    if (error || selectedProducts.length === 0) {
      setStepError(error || "Choose a product.");
      return;
    }

    if (address) {
      setDeliveryAddress(address);
    }

    for (const p of selectedProducts) {
      addItem(p, safeQuantity);
    }

    setProjectConfig({
      address: address?.label ?? "",
      desiredDate,
      materialFamily: materialFamily ?? "mulch",
      productId: product?.id ?? "",
      quantity: safeQuantity,
      debrisQuantity: materialFamily === "debris" ? safeQuantity : 0,
      services,
      prepLevel: activePrepLevel,
      notes: "",
    });

    setStepError("");
    setAdded(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)]">
      <GlassCard className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Question {currentStepIndex + 1} of {visibleSteps.length}
            </p>
            <h2 className="mt-2 text-3xl font-black text-emerald-950">
              {currentStepName}
            </h2>
          </div>
          <Badge variant="outline">{Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100)}%</Badge>
        </div>
        {stepError && (
          <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            {stepError}
          </div>
        )}

        {currentStepName === "Project location" && (
          <div>
            <div className="grid gap-2 text-sm font-bold text-emerald-950">
              Where is your project?
              <AddressAutocomplete
                key={address?.id ?? "new-address"}
                defaultValue={address?.label ?? ""}
                placeholder="Start typing project address"
                onInputChange={() => {
                  setAddress(null);
                  setDeliveryAddress(null);
                }}
                onSelect={(selectedAddress) => {
                  setAddress(selectedAddress);
                  setDeliveryAddress(
                    isOaklandCountyAddress(selectedAddress)
                      ? selectedAddress
                      : null,
                  );
                }}
              />
              {hasCountyBlockedAddress && (
                <p className="text-sm font-bold text-red-700">
                  {oaklandCountyDeliveryMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStepName === "Project timing" && (
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            When would you like to accomplish your project?
            <DatePicker
              value={desiredDate}
              onChange={setDesiredDate}
              minDate={localDateValue()}
            />
          </label>
        )}

        {currentStepName === "Material need" && (
          <div className="grid gap-4">
            <p className="text-sm font-semibold text-emerald-950/55">
              Select all that apply.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {materialOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex gap-3 rounded-3xl border p-4 text-left transition hover:cursor-pointer hover:-translate-y-0.5",
                    selectedMaterialFamilies.includes(option.value)
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-900/10 bg-white/70",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedMaterialFamilies.includes(option.value)}
                    onChange={() => toggleMaterialFamily(option.value)}
                    className="mt-1 size-4 accent-emerald-600 hover:cursor-pointer"
                  />
                  <span>
                    <span className="block font-black text-emerald-950">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-emerald-950/62">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStepName === "Mulch guidance" && (
          <div className="grid gap-4">
            <p className="text-sm font-semibold text-emerald-950/55">
              Select all that apply.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {mulchUseCases.map((useCase) => (
                <label
                  key={useCase.value}
                  className={cn(
                    "flex gap-3 rounded-3xl border p-4 text-left transition hover:cursor-pointer hover:-translate-y-0.5",
                    selectedMulchUseCases.includes(useCase.value)
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-900/10 bg-white/70",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedMulchUseCases.includes(useCase.value)}
                    onChange={() => toggleMulchUseCase(useCase)}
                    className="mt-1 size-4 accent-emerald-600 hover:cursor-pointer"
                  />
                  <span>
                    <span className="block font-black text-emerald-950">
                      {useCase.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-emerald-950/62">
                      {useCase.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {currentStepName === "Exact material" && (
          <div className="grid gap-4">
            <p className="text-sm font-semibold text-emerald-950/55">
              Select all that apply.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {productOptions.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex gap-3 rounded-3xl border p-4 text-left transition hover:cursor-pointer hover:-translate-y-0.5",
                    productIds.includes(option.id)
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-900/10 bg-white/70",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={productIds.includes(option.id)}
                    onChange={() =>
                      setProductIds((current) =>
                        current.includes(option.id)
                          ? current.filter((id) => id !== option.id)
                          : [...current, option.id],
                      )
                    }
                    className="mt-1 size-4 accent-emerald-600 hover:cursor-pointer"
                  />
                  <span>
                    <span className="block font-black text-emerald-950">
                      {option.name}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-emerald-950/62">
                      {option.description}
                    </span>
                    <span className="mt-3 block text-sm font-black text-emerald-800">
                      {formatCurrency(option.startingPrice)} / cubic yard
                    </span>
                  </span>
                </label>
              ))}
              {productOptions.length === 0 && (
                <div className="rounded-3xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
                  Select mulch in the previous step so there is a product to
                  add to the cart.
                </div>
              )}
            </div>
          </div>
        )}

        {currentStepName === "Quantity" && (
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-bold text-emerald-950">
              Quantity in whole cubic yards
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={(event) => updateQuantity(event.target.value)}
                placeholder="Example: 3"
              />
              <span className="text-xs font-semibold text-emerald-700">
                Enter whole cubic yards only. Online limit:{" "}
                {materialCaps[selectedFamily]} cubic yards.
              </span>
            </label>
            {materialFamily !== "debris" && (
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
                    <Calculator className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      Need help calculating?
                    </h3>
                    <p className="mt-0.5 text-xs leading-5 text-emerald-950/62">
                      Estimate cubic yards, then return and enter the rounded
                      quantity.
                    </p>
                  </div>
                </div>
                <Button asChild variant="secondary" size="sm" className="shrink-0">
                  <Link href="/calculator">Open calculator</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStepName === "Installation help" && (
          <div className="grid gap-4">
            <p className="text-sm font-semibold text-emerald-950/55">
              Select all that apply.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {serviceOptions.map((option) => (
                <label
                  key={option.key}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-3xl border p-4 transition hover:-translate-y-0.5",
                    services.includes(option.key)
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-emerald-900/10 bg-white/70",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={services.includes(option.key)}
                    onChange={() => toggleService(option.key)}
                    className="mt-1 size-4 accent-emerald-600 hover:cursor-pointer"
                  />
                  <span>
                    <span className="block font-black text-emerald-950">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-emerald-950/62">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {services.includes("sitePrep") && (
              <div className="rounded-3xl border border-emerald-900/10 bg-white/70 p-4">
                <p className="font-black text-emerald-950">
                  How much site prep is needed?
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-950/55">
                  Select one.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {prepOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex gap-3 rounded-2xl border p-4 transition hover:cursor-pointer hover:-translate-y-0.5",
                        prepLevel === option.value
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-emerald-900/10 bg-white",
                      )}
                    >
                      <input
                        type="radio"
                        name="prepLevel"
                        checked={prepLevel === option.value}
                        onChange={() => setPrepLevel(option.value)}
                        className="mt-1 size-4 accent-emerald-600 hover:cursor-pointer"
                      />
                      <span>
                        <span className="block font-black text-emerald-950">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-emerald-950/62">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStepName === "Review" && (
          <div className="rounded-3xl bg-emerald-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="size-6 text-emerald-200" />
              <h3 className="text-2xl font-black">You are all set.</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-emerald-50/75">
              Review the configuration on the side. Add it to your order when
              you are ready. This adds the exact mulch product and yard quantity
              to your cart.
            </p>
            <div className="mt-5 flex justify-center">
              <Button
                type="button"
                size="lg"
                className="bg-lime-400 text-emerald-950 hover:bg-lime-300"
                onClick={addProductToCart}
              >
                <ShoppingCart />
                Add product to cart
              </Button>
            </div>
            {added && (
              <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-emerald-50">
                <Check className="mr-2 inline size-4" />
                Added {selectedProducts.map((p) => `${safeQuantity} yd ${p.name}`).join(", ")}
                {services.length > 0 && (
                  <> + {services.map((k) => serviceOptions.find((o) => o.key === k)?.label).filter(Boolean).join(", ")}</>
                )}{" "}
                to cart.
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled={currentStepIndex === 0}
            onClick={goBack}
          >
            <ArrowLeft />
            Back
          </Button>
          {currentStepIndex < visibleSteps.length - 1 ? (
            <Button
              type="button"
              disabled={
                currentStepName === "Project location" &&
                hasCountyBlockedAddress
              }
              onClick={goNext}
            >
              Next
              <ArrowRight />
            </Button>
          ) : (
            <Button asChild variant="secondary">
              <Link href="/cart">Review cart</Link>
            </Button>
          )}
        </div>
      </GlassCard>

      <GlassCard className="h-fit p-5 sm:p-6 lg:sticky lg:top-28">
        <h2 className="text-2xl font-black text-emerald-950">
          Current order draft
        </h2>
        {address ||
        desiredDate ||
        selectedMaterialFamilies.length > 0 ||
        quantity ||
        selectedMulchUseCases.length > 0 ||
        services.length > 0 ? (
          <div className="mt-5 grid gap-4 text-sm">
            {address && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-emerald-700" />
                <span className="text-emerald-950/65">{address.label}</span>
              </div>
            )}
            {(product ||
              selectedMaterialFamilies.length > 0 ||
              desiredDate) && (
              <>
                <Separator />
                <div>
                  {selectedMaterialFamilies.length > 0 && (
                    <p className="text-emerald-950/62">
                      Material needs:{" "}
                      {selectedMaterialFamilies
                        .map(
                          (family) =>
                            materialOptions.find(
                              (option) => option.value === family,
                            )?.label,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {selectedMulchUseCases.length > 0 && (
                    <p className="mt-1 text-emerald-950/62">
                      Mulch guidance:{" "}
                      {selectedMulchUseCases
                        .map(
                          (useCaseValue) =>
                            mulchUseCases.find(
                              (useCase) => useCase.value === useCaseValue,
                            )?.label,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {selectedProducts.length > 0 && quantity && (
                    <p className="font-black text-emerald-950">
                      Products to add:{" "}
                      {selectedProducts
                        .map((p) => `${safeQuantity} yd ${p.name}`)
                        .join(", ")}
                    </p>
                  )}
                  {desiredDate && (
                    <p className="mt-1 text-emerald-950/62">
                      Desired date: {formatDisplayDate(desiredDate)}
                    </p>
                  )}
                </div>
              </>
            )}
            {services.length > 0 && (
              <div className="rounded-3xl bg-lime-50 p-4">
                <p className="font-black text-emerald-950">Selected services</p>
                <p className="mt-1 text-emerald-950/62">
                  {services
                    .map((k) => serviceOptions.find((o) => o.key === k)?.label)
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {selectedPrepOption && services.includes("sitePrep") && (
                  <p className="mt-1 text-emerald-950/62">
                    Site prep level: {selectedPrepOption.label}
                  </p>
                )}
              </div>
            )}
            {materialFamily && quantity && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-950/62">Product subtotal</span>
                    <span className="font-black text-emerald-950">
                      {formatCurrency(estimate.materialSubtotal)}
                    </span>
                  </div>
                  {serviceSubtotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-emerald-950/62">Selected services</span>
                      <span className="font-black text-emerald-950">
                        {formatCurrency(serviceSubtotal)}
                      </span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-black text-emerald-950">
                  <span>Estimated total</span>
                  <span>
                    {formatCurrency(estimate.materialSubtotal + serviceSubtotal)}
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm leading-6 text-emerald-950/62">
            Your answers will appear here as you move through the questions.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
