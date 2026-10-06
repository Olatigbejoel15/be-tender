"use client"; // uses Framer Motion, so it runs in the browser

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products"; // the type we defined

// Formats 28000 as "₦28,000"
const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0, // no kobo decimals
});

// product = the data for this card. index = its position, used for the staggered entrance.
export default function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }} // start: invisible, 40px lower
      whileInView={{ opacity: 1, y: 0 }} // animate when it scrolls into view
      viewport={{ once: true, margin: "-60px" }} // only once, slightly before it fully enters
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }} // each card waits a bit longer
      className="group" // "group" lets child elements react when the CARD is hovered
    >
      {/* Photo box: 4:5 shape, rounded, hides the zoom overflow */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105" // slow zoom on hover
        />

        {/* Badge (only if the product has one) */}
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-semibold">
            {product.badge}
          </span>
        )}

        {/* Add-to-cart button: always visible on phones (no hover there),
            slides up on hover for large screens. Not connected yet: we do that in Phase 12. */}
        <button className="glass absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300 lg:translate-y-[130%] lg:group-hover:translate-y-0">
          <ShoppingBag size={16} /> Add to cart
        </button>
      </div>

      {/* Text under the photo */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">{product.category}</p>
          <h3 className="mt-1 font-medium">{product.name}</h3>
        </div>
        <p className="font-semibold">{naira.format(product.price)}</p>
      </div>
    </motion.article>
  );
}