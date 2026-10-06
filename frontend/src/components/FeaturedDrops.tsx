"use client"; // uses Framer Motion

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { products } from "../data/products"; // our product list
import ProductCard from "@/components/ProductCard";

export default function FeaturedDrops() {
  return (
    // id="drops" is the target of the "Drops" link and the hero button.
    // scroll-mt-28 stops the fixed navbar from covering the title when you jump here.
    <section id="drops" className="scroll-mt-28 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading row: title on the left, "view all" link on the right */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
              Featured Drops
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Fresh off the rack.
            </h2>
          </div>
          <a
            href="#categories"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-accent"
          >
            View all <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Grid: 1 column on phones, 2 on tablets, 4 on large screens */}
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
{products.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}