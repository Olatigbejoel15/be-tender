"use client"; // uses Framer Motion, so it runs in the browser

import Image from "next/image";
import Link from "next/link"; // moves between pages without a full reload
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";
import { naira } from "@/lib/format"; // shared price formatter

// product = the data for this card. index = its position, used for the staggered entrance.
export default function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }} // start: invisible, 40px lower
      whileInView={{ opacity: 1, y: 0 }} // animate when it scrolls into view
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="group" // lets children react when the CARD is hovered
    >
      {/* The whole card is one link to this product's page */}
      <Link href={`/product/${product.slug}`} className="block">
        {/* Photo box: 4:5 shape, rounded, hides the zoom overflow */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badge (only if the product has one) */}
          {product.badge && (
            <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold">
              {product.badge}
            </span>
          )}

          {/* "View details" pill: always visible on phones (no hover there),
              slides up on hover for large screens. It's a span, not a button, because a link can't contain a button. */}
          <span className="glass absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300 lg:translate-y-[130%] lg:group-hover:translate-y-0">
            View details <ArrowUpRight size={16} />
          </span>
        </div>

        {/* Text under the photo */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-wide text-muted uppercase">{product.category}</p>
            <h3 className="mt-1 font-medium">{product.name}</h3>
          </div>
          <p className="font-semibold">{naira.format(product.price)}</p>
        </div>

        {/* Color dots: one small circle per color, using the hex from the data */}
        <div className="mt-3 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name} // tooltip on hover
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ backgroundColor: c.hex }} // the color comes from data, so it must be an inline style
            />
          ))}
          <span className="ml-1 text-xs text-muted">
            {product.colors.length} {product.colors.length === 1 ? "color" : "colors"}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}