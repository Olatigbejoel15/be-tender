import { notFound } from "next/navigation"; // shows a 404 page for unknown categories
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

// params holds the variable from the web address (e.g. { category: "men" }).
// In current Next.js it arrives as a Promise, so we await it.
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params; // slug = "men", "women" or "accessories"

  // Find the matching category. If someone types /shop/banana, show a 404.
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  // ALL products of this category (not just 3)
  const items = products.filter((p) => p.category === category.name);

  return (
    <>
      <Navbar />
      {/* pt-40 leaves room for the fixed announcement bar + navbar */}
      <main className="px-6 pt-40 pb-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Shop
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-2 text-muted">{category.tagline}</p>

          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}