"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { GeocodedAddress } from "@/lib/delivery";

type AddressAutocompleteProps = {
  defaultValue?: string;
  placeholder?: string;
  onSelect: (address: GeocodedAddress) => void;
  onInputChange?: (value: string) => void;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    house_number?: string;
    country_code?: string;
  };
};

type PhotonFeature = {
  properties: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
    postcode?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

type PhotonResponse = {
  features: PhotonFeature[];
};

type NormalizedAddressResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  precision: number;
};

const defaultEndpoint = "https://photon.komoot.io/api/";
const nominatimEndpoint = "https://nominatim.openstreetmap.org/search";

function toGeocodedAddress(place: NormalizedAddressResult): GeocodedAddress {
  return {
    id: place.id,
    label: place.label,
    longitude: place.longitude,
    latitude: place.latitude,
  };
}

function formatPhotonLabel(feature: PhotonFeature) {
  const { properties } = feature;
  const streetAddress = [properties.housenumber, properties.street]
    .filter(Boolean)
    .join(" ");
  const name = properties.name && properties.name !== streetAddress
    ? properties.name
    : "";

  return [
    streetAddress || name,
    streetAddress && name ? name : "",
    properties.city || properties.county,
    properties.state,
    properties.postcode,
    properties.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function normalizeResults(data: NominatimResult[] | PhotonResponse) {
  if (Array.isArray(data)) {
    return data
      .filter(
        (result) =>
          result.address?.country_code === "us" ||
          isUnitedStatesLabel(result.display_name),
      )
      .map((result) => ({
        id: String(result.place_id),
        label: result.display_name,
        latitude: Number(result.lat),
        longitude: Number(result.lon),
        precision:
          result.address?.house_number || result.type === "house" ? 2 : 1,
      }))
      .filter((result) => isUnitedStatesLabel(result.label));
  }

  return data.features
    .filter((feature) => feature.properties.countrycode === "US")
    .map((feature, index) => ({
      id: `${feature.properties.osm_type ?? "osm"}-${
        feature.properties.osm_id ?? index
      }`,
      label: formatPhotonLabel(feature),
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      precision: feature.properties.housenumber ? 2 : 0,
    }));
}

function isUnitedStatesLabel(label: string) {
  return /(?:united states|usa|\bmi\b|\bmichigan\b)$/i.test(label);
}

function getStreetTokens(query: string) {
  return query
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length >= 3);
}

function matchesStreetTokens(result: NormalizedAddressResult, query: string) {
  const streetTokens = getStreetTokens(query);

  if (streetTokens.length === 0) {
    return true;
  }

  const label = result.label.toLowerCase();

  return streetTokens.every((token) => label.includes(token));
}

function scoreResult(result: NormalizedAddressResult) {
  const isMichigan = /\bmichigan\b|\bmi\b/i.test(result.label);
  return result.precision + (isMichigan ? 3 : 0);
}

export function AddressAutocomplete({
  defaultValue = "",
  placeholder = "Start typing your delivery address",
  onSelect,
  onInputChange,
}: AddressAutocompleteProps) {
  const endpoint =
    process.env.NEXT_PUBLIC_OSM_GEOCODER_ENDPOINT ?? defaultEndpoint;
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<NormalizedAddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(defaultValue);
  const abortRef = useRef<AbortController | null>(null);
  const canSearch = query.trim().length >= 3 && query !== selectedAddress;
  const attribution = useMemo(
    () => (
      <p className="mt-2 text-xs font-semibold text-emerald-950/45">
        Address data © OpenStreetMap contributors.
      </p>
    ),
    [],
  );
  const hasHouseNumber = /\d/.test(query);

  useEffect(() => {
    if (!endpoint || !canSearch) {
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const url = new URL(endpoint);
        url.searchParams.set("q", query);
        url.searchParams.set("limit", "5");

        if (endpoint.includes("nominatim")) {
          url.searchParams.set("format", "jsonv2");
          url.searchParams.set("addressdetails", "1");
          url.searchParams.set("countrycodes", "us");
          url.searchParams.set("bounded", "1");
          url.searchParams.set("viewbox", "-83.7,42.85,-82.75,42.05");
        } else {
          url.searchParams.set("lang", "en");
          url.searchParams.set("lat", "42.3314");
          url.searchParams.set("lon", "-83.0458");
        }

        const localUrl = new URL(endpoint);
        localUrl.searchParams.set("q", `${query} Michigan`);
        localUrl.searchParams.set("limit", "5");

        if (endpoint.includes("nominatim")) {
          localUrl.searchParams.set("format", "jsonv2");
          localUrl.searchParams.set("addressdetails", "1");
          localUrl.searchParams.set("countrycodes", "us");
        } else {
          localUrl.searchParams.set("lang", "en");
          localUrl.searchParams.set("lat", "42.3314");
          localUrl.searchParams.set("lon", "-83.0458");
        }

        const [primaryResponse, localResponse, exactResponse, localExactResponse] =
          await Promise.all([
          fetch(url, {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }),
          hasHouseNumber
            ? fetch(localUrl, {
                signal: controller.signal,
                headers: {
                  Accept: "application/json",
                },
              })
            : Promise.resolve(null),
          hasHouseNumber
            ? fetch(
                `${nominatimEndpoint}?${new URLSearchParams({
                  q: query,
                  format: "jsonv2",
                  addressdetails: "1",
                  limit: "5",
                  countrycodes: "us",
                }).toString()}`,
                {
                  signal: controller.signal,
                  headers: {
                    Accept: "application/json",
                  },
                },
              )
            : Promise.resolve(null),
          hasHouseNumber
            ? fetch(
                `${nominatimEndpoint}?${new URLSearchParams({
                  q: `${query} Michigan`,
                  format: "jsonv2",
                  addressdetails: "1",
                  limit: "5",
                  countrycodes: "us",
                }).toString()}`,
                {
                  signal: controller.signal,
                  headers: {
                    Accept: "application/json",
                  },
                },
              )
            : Promise.resolve(null),
        ]);

        if (
          !primaryResponse.ok ||
          (localResponse && !localResponse.ok) ||
          (exactResponse && !exactResponse.ok) ||
          (localExactResponse && !localExactResponse.ok)
        ) {
          throw new Error("Address search failed");
        }

        const primaryData = (await primaryResponse.json()) as
          | NominatimResult[]
          | PhotonResponse;
        const localData = localResponse
          ? ((await localResponse.json()) as NominatimResult[] | PhotonResponse)
          : [];
        const exactData = exactResponse
          ? ((await exactResponse.json()) as NominatimResult[])
          : [];
        const localExactData = localExactResponse
          ? ((await localExactResponse.json()) as NominatimResult[])
          : [];
        const mergedResults = [
          ...normalizeResults(localExactData),
          ...normalizeResults(exactData),
          ...normalizeResults(localData),
          ...normalizeResults(primaryData),
        ].filter((result) =>
          hasHouseNumber ? matchesStreetTokens(result, query) : true,
        );
        const dedupedResults = Array.from(
          new Map(
            mergedResults
              .sort((a, b) => scoreResult(b) - scoreResult(a))
              .map((result) => [result.label, result]),
          ).values(),
        ).slice(0, 5);

        setResults(dedupedResults);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [canSearch, endpoint, hasHouseNumber, query]);

  return (
    <div className="address-autocomplete">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-emerald-950/35" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedAddress("");
            if (event.target.value.trim().length < 3) {
              setResults([]);
            }
            onInputChange?.(event.target.value);
          }}
          placeholder={placeholder}
          className={cn(
            "h-12 w-full rounded-2xl border border-emerald-900/10 bg-white/80 px-10 text-base text-emerald-950 shadow-inner shadow-emerald-950/5 outline-none transition-all placeholder:text-emerald-950/35 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15",
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-emerald-700" />
        )}
      </div>
      {results.length > 0 && (
        <div className="mt-2 max-h-72 overflow-auto rounded-3xl border border-emerald-900/10 bg-white p-2 shadow-2xl shadow-emerald-950/15">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => {
                const address = toGeocodedAddress(result);
                setQuery(address.label);
                setSelectedAddress(address.label);
                setResults([]);
                onSelect(address);
              }}
              className="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-emerald-950 transition hover:cursor-pointer hover:bg-emerald-50"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <span>{result.label}</span>
            </button>
          ))}
        </div>
      )}
      {attribution}
    </div>
  );
}
