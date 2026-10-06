"use client"; // uses Framer Motion, so it runs in the browser

import Link from "next/link"; // Next's link: moves between pages without a full reload
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard"; // the card we built in Phase 4

export default function Categories() {
  return (
    // id="categories" is the target of the "Categories" navbar link
    <section id="categories" className="scroll-mt-28 bg-sand px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
            Shop by category
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Find your fit.
          </h2>
        </motion.div>

        {/* One block per category. space-y-20 = gap between the blocks. */}
        <div className="mt-14 space-y-20">
          {categories.map((cat) => {
            // Take only THIS category's products, and keep the first 3 as samples
            const samples = products
              .filter((p) => p.category === cat.name)
              .slice(0, 3);

            return (
              <div key={cat.slug}>
                {/* Row: category name on the left, "View all" link on the right */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-end justify-between gap-4 border-b border-black/10 pb-4"
                >
                  <div>
                    <h3 className="text-2xl font-semibold sm:text-3xl">{cat.name}</h3>
                    <p className="mt-1 text-sm text-muted">{cat.tagline}</p>
                  </div>
                  {/* Goes to /shop/men, /shop/women or /shop/accessories */}
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-accent"
                  >
                    View all {cat.name} <ArrowRight size={16} />
                  </Link>
                </motion.div>

                {/* The 3 sample products: 1 column on phones, 2 on tablets, 3 on large screens */}
                <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {samples.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}