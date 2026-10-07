import type { Metadata } from "next";
import { notFound } from "next/navigation"; // shows a 404 for unknown products
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

// Tells Next which product pages exist, so it can prepare them in advance.
// When we move to the Laravel API, this changes.
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

// Sets the browser tab title and search description for each product
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; // params arrives as a Promise in current Next.js
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  return { title: `${product.name} | BE TENDER`, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound(); // /product/banana shows a 404

  // Up to 4 other products from the same category
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Navbar />
      {/* pt-40 leaves room for the fixed announcement bar + navbar */}
      <main className="px-6 pt-40 pb-24">
        <ProductDetail product={product} />

        {/* "You may also like": only shown if there are related products */}
        {related.length > 0 && (
          <section className="mx-auto mt-24 max-w-7xl">
            <h2 className="text-3xl font-semibold tracking-tight">You may also like</h2>
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}