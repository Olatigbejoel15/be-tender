import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import ShopGrid from "@/components/ShopGrid";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop | BE TENDER",
  description: "Browse all Be Tender gym wear and accessories.",
};

export default function ShopPage() {
  return (
    <PageShell eyebrow="Shop" title="All products" intro="Everything in the Be Tender collection. Use the filters to find your fit.">
      {/* showCategories adds the All / Women / Men / Accessories tabs */}
      <ShopGrid products={products} showCategories />
    </PageShell>
  );
}