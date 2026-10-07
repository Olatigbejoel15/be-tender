import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/search";
import { categories } from "@/data/categories";

export const metadata: Metadata = {
  title: "Search | BE TENDER",
};

// searchParams holds what's after the ? in the address, e.g. /search?q=leggings -> { q: "leggings" }.
// In current Next.js it arrives as a Promise, so we await it.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = searchProducts(query); // the same function the search panel uses

  return (
    <PageShell
      eyebrow="Search"
      title={query ? `Results for "${query}"` : "Search"}
      intro={
        query
          ? `${results.length} ${results.length === 1 ? "product" : "products"} found.`
          : "Use the search icon in the menu to find gym wear."
      }
    >
      {results.length > 0 ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i % 4} />
          ))}
        </div>
      ) : (
        // Nothing found (or nothing typed): point the visitor somewhere useful
        <div className="rounded-3xl border border-black/10 px-6 py-16 text-center">
          <p className="text-lg font-semibold">{query ? "We couldn't find a match." : "Start typing to search."}</p>
          <p className="mt-2 text-sm text-muted">Try a different word, or browse a category.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold transition hover:border-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}