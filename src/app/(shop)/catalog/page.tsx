"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { catalogItems } from "../../../lib/catalog";

const categories = [
  { id: "all", label: "All categories" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "dresses", label: "Dresses" },
  { id: "outerwear", label: "Outerwear" },
  { id: "childrenswear", label: "Childrenswear" },
  { id: "unisex", label: "Unisex" },
] as const;

const complexities = [
  { id: "all", label: "All complexity" },
  { id: "Simple", label: "Simple" },
  { id: "Standard", label: "Standard" },
  { id: "Advanced", label: "Advanced" },
] as const;

export default function CatalogPage() {
  const [category, setCategory] = useState<(typeof categories)[number]["id"]>(
    "all",
  );
  const [complexity, setComplexity] = useState<
    (typeof complexities)[number]["id"]
  >("all");
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>("all");

  useEffect(() => {
    document.title = "Catalog – Pattern Studio";
  }, []);

  const bodyTypes = useMemo(
    () =>
      Array.from(
        new Set(catalogItems.flatMap((item) => item.supportedBodyTypes)),
      ),
    [],
  );

  const filteredItems = useMemo(
    () =>
      catalogItems.filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (complexity !== "all" && item.complexityLabel !== complexity)
          return false;
        if (
          bodyTypeFilter !== "all" &&
          !item.supportedBodyTypes.includes(bodyTypeFilter)
        ) {
          return false;
        }
        return true;
      }),
    [category, complexity, bodyTypeFilter],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Garment catalog
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse base blocks and pattern types like a clothing shop, then
            configure them for your client.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as (typeof categories)[number]["id"])
            }
            className="rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={complexity}
            onChange={(e) =>
              setComplexity(
                e.target.value as (typeof complexities)[number]["id"],
              )
            }
            className="rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {complexities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={bodyTypeFilter}
            onChange={(e) => setBodyTypeFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All body types</option>
            {bodyTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-600">
              No garments match your filters. Try adjusting your selection.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Link
              key={item.slug}
              href={`/product/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-500 hover:shadow-md"
            >
              <div className="relative h-40 w-full overflow-hidden border-b border-slate-200 bg-slate-50">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  fill
                  className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-sky-600">
                    {item.categoryLabel}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                    {item.complexityLabel}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h2>
                <p className="line-clamp-2 text-xs text-slate-600">
                  {item.shortDescription}
                </p>
                <div className="mt-auto flex flex-wrap gap-1 pt-2 text-[10px] text-slate-600">
                  {item.supportedBodyTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-slate-100 px-2 py-0.5"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}

