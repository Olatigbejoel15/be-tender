import { notFound } from "next/navigation"; // shows a 404 page for unknown categories
import PageShell from "@/components/PageShell";
import ShopGrid from "@/components/ShopGrid";
import { getProducts } from "@/lib/api"; // data now comes from Laravel
import { categories } from "@/data/categories";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params; // slug = "men", "women" or "accessories"

  // Find the matching category. If someone types /shop/banana, show a 404.
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const items = await getProducts({ category: slug }); // the API filters by category slug

  return (
    <PageShell eyebrow="Shop" title={category.name} intro={category.tagline}>
      <ShopGrid products={items} />
    </PageShell>
  );
}