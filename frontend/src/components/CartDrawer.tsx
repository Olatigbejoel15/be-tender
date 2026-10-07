"use client"; // uses state from the cart, effects and Framer Motion

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { naira } from "@/lib/format";

const FREE_DELIVERY = 50000; // free delivery threshold, in naira

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, setQty, removeItem } = useCart();

  // While the drawer is open: Escape closes it, and the page behind can't scroll
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock the page scroll
    return () => {
      window.removeEventListener("keydown", onKey); // cleanup when it closes
      document.body.style.overflow = previous; // unlock the scroll
    };
  }, [isOpen, closeCart]);

  // Progress toward free delivery
  const remaining = Math.max(0, FREE_DELIVERY - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY) * 100);

  return (
    // AnimatePresence lets the overlay and panel animate OUT before they're removed
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart} // clicking the dark area closes the drawer
          className="fixed inset-0 z-[60] bg-black/40"
          aria-hidden
        />
      )}

      {isOpen && (
        <motion.aside
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          initial={{ x: "100%" }} // starts fully off the right edge
          animate={{ x: 0 }} // slides in
          exit={{ x: "100%" }} // slides back out
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-0 right-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
            <h2 className="text-lg font-semibold">Your cart ({count})</h2>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="rounded-full p-2 transition hover:bg-black/5"
            >
              <X size={20} />
            </button>
          </div>

          {items.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                <ShoppingBag size={28} />
              </span>
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="max-w-xs text-sm text-muted">
                Find something you love and it will show up here.
              </p>
              <Link
                href="/#drops"
                onClick={closeCart}
                className="mt-2 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-white uppercase"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Free delivery progress */}
              <div className="border-b border-black/10 px-6 py-4">
                <p className="flex items-center gap-2 text-sm">
                  <Truck size={16} className="shrink-0 text-accent" />
                  {remaining > 0 ? (
                    <span>
                      Add <strong>{naira.format(remaining)}</strong> more for free delivery
                    </span>
                  ) : (
                    <strong>You&apos;ve unlocked free delivery</strong>
                  )}
                </p>
                {/* The bar: grey track + accent fill whose width follows the progress */}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* The items. flex-1 + overflow-y-auto = this area scrolls if there are many. */}
              <ul className="flex-1 divide-y divide-black/10 overflow-y-auto px-6">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-4 py-5">
                    {/* Photo, links to the product */}
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-sand"
                    >
                      <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="block font-medium transition-colors hover:text-accent"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-muted">
                            {item.color} · {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-black/5 hover:text-ink"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Quantity stepper + line total. mt-auto pushes this row to the bottom of the item. */}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-ink/15">
                          <button
                            onClick={() => setQty(item.key, item.qty - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.key, item.qty + 1)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-semibold">{naira.format(item.price * item.qty)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer: subtotal and checkout */}
              <div className="border-t border-black/10 px-6 py-5">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{naira.format(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Delivery and taxes are calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-accent py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase shadow-lg"
                >
                  Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="mt-3 w-full text-center text-sm font-medium text-muted underline underline-offset-4 transition-colors hover:text-accent"
                >
                  Continue shopping
                </button>
              </div>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}