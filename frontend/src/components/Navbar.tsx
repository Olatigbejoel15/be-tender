"use client"; // runs in the browser (state + animations)

import { useCallback, useState } from "react"; // useCallback keeps a function stable between renders
import { motion, AnimatePresence } from "framer-motion"; // animations
import { ShoppingBag, Menu, X, Search, User } from "lucide-react"; // icons
import ThemeToggle from "@/components/ThemeToggle"; // the light/navy switch
import SearchOverlay from "@/components/SearchOverlay"; // the search panel
import { useCart } from "@/context/CartContext"; // the shared cart

// Menu items in one list so we don't repeat code
const links = [
  { label: "Shop", href: "/shop" },
  { label: "Drops", href: "/#drops" },
  { label: "Categories", href: "/#categories" },
  { label: "Lookbook", href: "/#lookbook" },
  { label: "Reviews", href: "/#reviews" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false); // is the mobile menu showing? starts closed
  const [searchOpen, setSearchOpen] = useState(false); // is the search panel showing?
  const closeSearch = useCallback(() => setSearchOpen(false), []); // stable, so the panel's effect doesn't restart on every render
  const { count, openCart } = useCart(); // count = items in the cart, openCart = show the drawer

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      {/* Announcement bar */}
      <div className="bg-sand py-2 text-center text-xs font-medium tracking-wide">
        Free delivery on orders over ₦50,000
      </div>

      <nav className="w-full border-b border-black/5 bg-white">
        {/* grid-cols-[1fr_auto_1fr] = left zone | center zone | right zone */}
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6">
          {/* LEFT: brand name */}
          <a href="/" className="text-xl font-bold tracking-[0.25em]">
            BE TENDER
          </a>

          {/* CENTER: links (hidden on phones) */}
          <ul className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* RIGHT: icons */}
          <div className="col-start-3 flex items-center gap-1 justify-self-end">
            {/* Search: opens the search panel */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden rounded-full p-2.5 transition hover:bg-black/5 md:block"
            >
              <Search size={20} />
            </button>
            <button aria-label="Account" className="hidden rounded-full p-2.5 transition hover:bg-black/5 md:block">
              <User size={20} />
            </button>

            {/* The theme switch: visible on every screen size */}
            <ThemeToggle />

            {/* Cart button: opens the drawer */}
            <motion.button
              onClick={openCart}
              whileTap={{ scale: 0.92 }}
              aria-label={`Open cart, ${count} items`}
              className="relative rounded-full p-2.5 transition hover:bg-black/5"
            >
              <ShoppingBag size={20} />
              {/* Count badge: only shown when the cart has items */}
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>

            {/* Menu toggle: phones only */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="rounded-full p-2.5 transition hover:bg-black/5 md:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu: solid panel under the navbar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-h-[80vh] overflow-y-auto border-b border-black/5 bg-white px-6 py-5 shadow-lg md:hidden"
          >
            {/* Search box: looks like a search field, but opens the search panel when tapped */}
            <button
              onClick={() => {
                setOpen(false); // close the menu
                setSearchOpen(true); // open the search panel
              }}
              className="flex w-full items-center gap-3 rounded-full bg-sand px-4 py-3 text-left text-sm text-muted"
            >
              <Search size={18} />
              Search gym wear...
            </button>

            {/* Page links */}
            <ul className="mt-3">
              {links.map((link) => (
                <li key={link.href} className="border-b border-black/5 last:border-0">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-base font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Account link */}
            <a
              href="#account"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center gap-3 py-3 text-base font-medium"
            >
              <User size={20} /> Account
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The search panel itself (invisible until opened) */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}