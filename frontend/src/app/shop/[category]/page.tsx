import { notFound } from "next/navigation"; // shows a 404 page for unknown categories
import PageShell from "@/components/PageShell";
import ShopGrid from "@/components/ShopGrid";
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

  // Only this category's products. The filters inside ShopGrid are built from these.
  const items = products.filter((p) => p.category === category.name);

  return (
    <PageShell eyebrow="Shop" title={category.name} intro={category.tagline}>
      <ShopGrid products={items} />
    </PageShell>
  );
}