"use client"; // uses state (which filters are chosen) and Framer Motion

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { categories } from "@/data/categories";

// Clothing sizes in their natural order. Other options (like "500ml") are added after these.
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

// The price choices. "test" says whether a price fits that range.
const priceRanges: { label: string; test: (price: number) => boolean }[] = [
  { label: "Any price", test: () => true },
  { label: "Under ₦15,000", test: (p) => p < 15000 },
  { label: "₦15,000 – ₦25,000", test: (p) => p >= 15000 && p <= 25000 },
  { label: "Over ₦25,000", test: (p) => p > 25000 },
];

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

// Adds the value to the list if it's missing, removes it if it's there (used by the filter chips)
const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// One small clickable pill. "active" makes it dark.
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

// products = the list to show. showCategories = show the All / Women / Men / Accessories tabs.
export default function ShopGrid({ products, showCategories = false }: { products: Product[]; showCategories?: boolean }) {
  const [category, setCategory] = useState("All");
  const [sizes, setSizes] = useState<string[]>([]); // chosen sizes
  const [colors, setColors] = useState<string[]>([]); // chosen color names
  const [rangeIdx, setRangeIdx] = useState(0); // chosen price range (0 = any)
  const [sort, setSort] = useState("featured");
  const [panelOpen, setPanelOpen] = useState(false); // is the Filters panel showing?

  // The size and color choices, built from the products we were given (only recalculated if they change)
  const sizeOptions = useMemo(() => {
    const all = Array.from(new Set(products.flatMap((p) => p.sizes)));
    const rank = (s: string) => (SIZE_ORDER.includes(s) ? SIZE_ORDER.indexOf(s) : 99); // unknown sizes go last
    return all.sort((a, b) => rank(a) - rank(b));
  }, [products]);

  const colorOptions = useMemo(() => {
    const seen = new Map<string, string>(); // name -> hex, so each color appears once
    products.forEach((p) => p.colors.forEach((c) => seen.set(c.name, c.hex)));
    return Array.from(seen, ([name, hex]) => ({ name, hex }));
  }, [products]);

  // Apply every filter, then sort
  const visible = useMemo(() => {
    const list = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        priceRanges[rangeIdx].test(p.price) &&
        (sizes.length === 0 || p.sizes.some((s) => sizes.includes(s))) &&
        (colors.length === 0 || p.colors.some((c) => colors.includes(c.name)))
    );
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, rangeIdx, sizes, colors, sort]);

  // How many filters are active (shown on the Filters button)
  const activeCount = sizes.length + colors.length + (rangeIdx > 0 ? 1 : 0);

  const clearAll = () => {
    setSizes([]);
    setColors([]);
    setRangeIdx(0);
    setCategory("All");
  };

  return (
    <div>
      {/* TOP ROW: category tabs on the left, Filters + sort on the right */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {showCategories &&
            ["All", ...categories.map((c) => c.name)].map((name) => (
              <Chip key={name} active={category === name} onClick={() => setCategory(name)}>
                {name}
              </Chip>
            ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition hover:border-ink"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-white">
                {activeCount}
              </span>
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-accent"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FILTERS PANEL: slides open and closed. height 0 to "auto" animates the opening. */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid gap-8 rounded-3xl border border-black/10 bg-white p-6 sm:grid-cols-3">
              {/* Size */}
              <div>
                <p className="text-sm font-semibold">Size</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizeOptions.map((s) => (
                    <Chip key={s} active={sizes.includes(s)} onClick={() => setSizes(toggle(sizes, s))}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <p className="text-sm font-semibold">Color</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colorOptions.map((c) => (
                    <Chip key={c.name} active={colors.includes(c.name)} onClick={() => setColors(toggle(colors, c.name))}>
                      <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Price: one at a time */}
              <div>
                <p className="text-sm font-semibold">Price</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {priceRanges.map((r, i) => (
                    <Chip key={r.label} active={rangeIdx === i} onClick={() => setRangeIdx(i)}>
                      {r.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count + clear link */}
      <div className="mt-8 flex items-center justify-between text-sm text-muted">
        <p>
          {visible.length} {visible.length === 1 ? "product" : "products"}
        </p>
        {(activeCount > 0 || category !== "All") && (
          <button onClick={clearAll} className="font-medium underline underline-offset-4 transition-colors hover:text-accent">
            Clear all filters
          </button>
        )}
      </div>

      {/* The grid, or an empty message when nothing matches */}
      {visible.length > 0 ? (
        <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* index % 4 keeps the entrance delay short even in a long list */}
          {visible.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i % 4} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-black/10 px-6 py-16 text-center">
          <p className="text-lg font-semibold">No products match these filters.</p>
          <p className="mt-2 text-sm text-muted">Try removing a filter to see more.</p>
          <button
            onClick={clearAll}
            className="mt-6 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}