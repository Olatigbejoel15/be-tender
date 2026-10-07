"use client"; // uses state (selected color, size, quantity) and Framer Motion

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, ChevronRight, ChevronDown, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import type { Product } from "@/data/products";
import { naira } from "@/lib/format";
import { useCart } from "@/context/CartContext"; // the shared cart

export default function ProductDetail({ product }: { product: Product }) {
  // All photos: the main one first, then any extras from "gallery"
  const photos = [product.image, ...(product.gallery ?? [])];

  const [photo, setPhoto] = useState(0); // which photo is showing (0 = first)
  const [colorIdx, setColorIdx] = useState(0); // which color is selected (starts with the first)
  const [size, setSize] = useState<string | null>(null); // selected size: null = nothing chosen yet
  const [qty, setQty] = useState(1); // quantity
  const [status, setStatus] = useState<"idle" | "needSize" | "added">("idle"); // message under the button

  const { addItem } = useCart(); // adds an item to the shared cart

  const color = product.colors[colorIdx]; // the selected color object
  const soldOut = product.soldOut ?? []; // sizes that can't be picked
  const sizeLabel = product.sizeLabel ?? "Size"; // "Size", "Capacity", "Resistance"...
  const categorySlug = product.category.toLowerCase(); // "Men" -> "men", for the breadcrumb link

  const addToCart = () => {
    // A size must be chosen first
    if (!size) {
      setStatus("needSize");
      return;
    }
    
    // Send this exact combination to the cart (the cart drawer opens by itself)
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      color: color.name,
      size,
      qty,
    });
    setStatus("added");
  };

  // The expandable sections at the bottom. "open" means expanded at first.
  const sections = [
    { title: "Description", open: true, body: <p>{product.description}</p> },
    {
      title: "Features",
      open: false,
      body: (
        <ul className="list-disc space-y-1.5 pl-5">
          {product.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Fabric and care",
      open: false,
      body: (
        <div className="space-y-2">
          <p>{product.fabric}</p>
          <p>{product.care}</p>
        </div>
      ),
    },
    {
      title: "Delivery and returns",
      open: false,
      body: (
        <p>
          Free delivery on orders over ₦50,000. Lagos orders usually arrive in 1 to 3 working days,
          other states in 3 to 7. Unworn items with tags can be returned within 30 days.
        </p>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb: Home > Men > Product name */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted">
        <Link href="/" className="transition-colors hover:text-accent">Home</Link>
        <ChevronRight size={14} />
        <Link href={`/shop/${categorySlug}`} className="transition-colors hover:text-accent">{product.category}</Link>
        <ChevronRight size={14} />
        <span className="text-ink">{product.name}</span>
      </nav>

      {/* Two columns on large screens: photos left, details right */}
      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* LEFT: gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand">
            {/* key={photos[photo]} makes React treat each photo as new, so it fades in when you switch */}
            <motion.div
              key={photos[photo]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={photos[photo]}
                alt={product.name}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            {product.badge && (
              <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-semibold">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails: only shown when the product has more than one photo */}
          {photos.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {photos.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setPhoto(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                    i === photo ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: details. lg:sticky keeps it in view while the left side is taller. */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">{product.category}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold">{naira.format(product.price)}</p>

          {/* COLOR picker */}
          <div className="mt-8">
            <p className="text-sm font-semibold">
              Color: <span className="font-normal text-muted">{color.name}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => {
                    setColorIdx(i);
                    setStatus("idle"); // clear old messages
                  }}
                  aria-label={c.name}
                  title={c.name}
                  // ring + ring-offset draws the outer circle around the selected color
                  className={`h-9 w-9 rounded-full border border-black/10 transition ${
                    i === colorIdx ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* SIZE picker */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                {sizeLabel}: <span className="font-normal text-muted">{size ?? "Select"}</span>
              </p>
              <Link href="/contact" className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-accent">
                Need help choosing?
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.sizes.map((s) => {
                const out = soldOut.includes(s); // is this option unavailable?
                const active = size === s; // is this the selected one?
                return (
                  <button
                    key={s}
                    disabled={out}
                    onClick={() => {
                      setSize(s);
                      setStatus("idle");
                    }}
                    aria-pressed={active}
                    className={`min-w-14 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      out
                        ? "cursor-not-allowed border-ink/10 text-muted line-through opacity-50"
                        : active
                          ? "border-ink bg-ink text-white"
                          : "border-ink/15 hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUANTITY + ADD TO CART */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Stepper: Math.max / Math.min keep the number between 1 and 10 */}
            <div className="flex items-center rounded-full border border-ink/15">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
                className="flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-black/5"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(Math.min(10, qty + 1))}
                aria-label="Increase quantity"
                className="flex h-12 w-12 items-center justify-center rounded-full transition hover:bg-black/5"
              >
                <Plus size={16} />
              </button>
            </div>

            <motion.button
              onClick={addToCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-8 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg"
            >
              <ShoppingBag size={18} /> Add to cart
            </motion.button>
          </div>

          {/* Message under the button. min-h reserves space so the layout doesn't jump. */}
          <div className="mt-3 min-h-6 text-sm">
            <AnimatePresence mode="wait">
              {status === "needSize" && (
                <motion.p key="n" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-600">
                  Please choose a {sizeLabel.toLowerCase()} first.
                </motion.p>
              )}
              {status === "added" && (
                <motion.p key="a" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="font-medium text-green-700">
                  Added: {qty} × {product.name}, {color.name}, {size}.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Trust points */}
          <ul className="mt-6 grid gap-3 border-y border-black/10 py-6 text-sm text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck size={18} className="shrink-0 text-accent" /> Free delivery over ₦50k</li>
            <li className="flex items-center gap-2"><RotateCcw size={18} className="shrink-0 text-accent" /> 30-day returns</li>
            <li className="flex items-center gap-2"><ShieldCheck size={18} className="shrink-0 text-accent" /> Secure payment</li>
          </ul>

          {/* Expandable sections. <details> is built into HTML: it opens and closes with no JavaScript.
              group-open: styles the chevron when the section is open. */}
          <div className="mt-2">
            {sections.map((s) => (
              <details key={s.title} open={s.open} className="group border-b border-black/10 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
                  {s.title}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-muted">{s.body}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}