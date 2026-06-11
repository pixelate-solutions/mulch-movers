"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/delivery";
import { shoppableProducts } from "@/lib/products";
import type { Product, ProductCategory } from "@/types/product";

import { ProductCard } from "./product-card";

type CategoryFilter = "All" | ProductCategory;
type PriceFilter = "all" | "under-40" | "40-50" | "over-50";
type SortOption = "featured" | "price-low" | "price-high" | "name";

const categoryFilters: CategoryFilter[] = ["All", "Mulch"];

const priceFilters: { label: string; value: PriceFilter }[] = [
  { label: "Any price", value: "all" },
  { label: `Under ${formatCurrency(40)}`, value: "under-40" },
  { label: `${formatCurrency(40)} to ${formatCurrency(50)}`, value: "40-50" },
  { label: `Over ${formatCurrency(50)}`, value: "over-50" },
];

function matchesPriceFilter(product: Product, priceFilter: PriceFilter) {
  if (priceFilter === "under-40") {
    return product.startingPrice < 40;
  }

  if (priceFilter === "40-50") {
    return product.startingPrice >= 40 && product.startingPrice <= 50;
  }

  if (priceFilter === "over-50") {
    return product.startingPrice > 50;
  }

  return true;
}

export function ShopGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("featured");

  const categoryCounts = useMemo(() => {
    return shoppableProducts.reduce<Record<CategoryFilter, number>>(
      (counts, product) => {
        counts.All += 1;
        counts[product.category] += 1;
        return counts;
      },
      { All: 0, Mulch: 0, Stone: 0, Sand: 0, Soil: 0 },
    );
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return shoppableProducts
      .filter((product) => {
        const searchableText = [
          product.name,
          product.category,
          product.description,
          product.availability,
        ]
          .join(" ")
          .toLowerCase();

        return (
          (category === "All" || product.category === category) &&
          matchesPriceFilter(product, priceFilter) &&
          (!normalizedQuery || searchableText.includes(normalizedQuery))
        );
      })
      .sort((firstProduct, secondProduct) => {
        if (sortOption === "price-low") {
          return firstProduct.startingPrice - secondProduct.startingPrice;
        }

        if (sortOption === "price-high") {
          return secondProduct.startingPrice - firstProduct.startingPrice;
        }

        if (sortOption === "name") {
          return firstProduct.name.localeCompare(secondProduct.name);
        }

        return 0;
      });
  }, [category, priceFilter, query, sortOption]);

  const hasActiveFilters =
    query.trim().length > 0 || category !== "All" || priceFilter !== "all";

  function clearFilters() {
    setQuery("");
    setCategory("All");
    setPriceFilter("all");
    setSortOption("featured");
  }

  return (
    <section className="space-y-6" aria-label="Mulch products">
      <div className="rounded-[1.5rem] border border-emerald-900/10 bg-white/70 p-4 shadow-sm shadow-emerald-950/5 backdrop-blur sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem_12rem] lg:items-end">
          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Search materials
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-emerald-900/45" />
              <Input
                type="text"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search mulch..."
                className="pl-11 pr-11"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-emerald-900/55 transition hover:cursor-pointer hover:bg-emerald-100 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </label>

          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Starting price
            <Select
              value={priceFilter}
              onValueChange={(value) => setPriceFilter(value as PriceFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                {priceFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-emerald-950">
            Sort
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: low to high</SelectItem>
                <SelectItem value="price-high">Price: high to low</SelectItem>
                <SelectItem value="name">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t border-emerald-900/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter by category">
            {categoryFilters.map((categoryFilter) => {
              const isSelected = category === categoryFilter;

              return (
                <button
                  key={categoryFilter}
                  type="button"
                  onClick={() => setCategory(categoryFilter)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/15"
                      : "bg-emerald-50 text-emerald-950 hover:cursor-pointer hover:bg-emerald-100"
                  }`}
                  aria-pressed={isSelected}
                >
                  {categoryFilter}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isSelected ? "bg-white/18 text-white" : "bg-white text-emerald-800"
                    }`}
                  >
                    {categoryCounts[categoryFilter]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-emerald-950/62">
            <span>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "material" : "materials"}
            </span>
            {hasActiveFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                <SlidersHorizontal />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-emerald-900/20 bg-white/60 px-6 py-12 text-center">
          <p className="text-lg font-black text-emerald-950">
            No materials match those filters.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-950/62">
            Try a different category, price range, or search term.
          </p>
          <Button type="button" className="mt-5" onClick={clearFilters}>
            <X />
            Reset filters
          </Button>
        </div>
      )}
    </section>
  );
}
