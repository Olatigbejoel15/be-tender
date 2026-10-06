"use client"; // runs in the browser (state + animations)

import { useState } from "react"; // memory for the open/closed mobile menu
import { motion, AnimatePresence } from "framer-motion"; // animations
import { ShoppingBag, Menu, X, Search, User } from "lucide-react"; // icons

// Menu items in one list so we don't repeat code
const links = [
  { label: "Drops", href: "#drops" },
  { label: "Categories", href: "#categories" },
  { label: "Why Us", href: "#why" },
  { label: "Lookbook", href: "#lookbook" },
  { label: "Reviews", href: "#reviews" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false); // is the mobile menu showing? starts closed

  return (
    // bg-white = fully solid. fixed + inset-x-0 = stuck to the top, full width
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      {/* Announcement bar: thin strip above the navbar */}
      <div className="bg-sand py-2 text-center text-xs font-medium tracking-wide">
        Free delivery on orders over ₦50,000
      </div>

      {/* The navbar itself: solid white with a thin bottom line */}
      <nav className="w-full border-b border-black/5 bg-white">
        {/* Inner container keeps content centered.
            grid-cols-[1fr_auto_1fr] = left zone | center zone | right zone */}
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6">
          {/* LEFT: brand name */}
          <a href="#home" className="text-xl font-bold tracking-[0.25em]">
            BE TENDER
          </a>

          {/* CENTER: links (hidden on phones, shown from md screens up) */}
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

          {/* RIGHT: icons, pushed to the far right edge */}
          <div className="col-start-3 flex items-center gap-1 justify-self-end">
            {/* Search + account icons: desktop only, because phones get them inside the menu */}
            <button aria-label="Search" className="hidden rounded-full p-2.5 transition hover:bg-black/5 md:block">
              <Search size={20} />
            </button>
            <button aria-label="Account" className="hidden rounded-full p-2.5 transition hover:bg-black/5 md:block">
              <User size={20} />
            </button>

            {/* Cart with a count badge */}
            <motion.button
              whileTap={{ scale: 0.92 }} // small press effect
              aria-label="Open cart"
              className="relative rounded-full p-2.5 transition hover:bg-black/5"
            >
              <ShoppingBag size={20} />
              {/* Badge: static 0 for now, we'll connect it to the real cart later */}
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                0
              </span>
            </motion.button>

            {/* Menu toggle: phones only */}
            <button
              onClick={() => setOpen(!open)} // flip open/closed
              aria-label="Toggle menu"
              className="rounded-full p-2.5 transition hover:bg-black/5 md:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu: solid white panel under the navbar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} // enter: invisible, slightly up
            animate={{ opacity: 1, y: 0 }}  // visible
            exit={{ opacity: 0, y: -8 }}    // leave: fade up
            className="max-h-[80vh] overflow-y-auto border-b border-black/5 bg-white px-6 py-5 shadow-lg md:hidden"
          >
            {/* Search box: the search icon now lives here on phones */}
            <div className="flex items-center gap-3 rounded-full bg-sand px-4 py-3">
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>

            {/* Page links */}
            <ul className="mt-3">
              {links.map((link) => (
                <li key={link.href} className="border-b border-black/5 last:border-0">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)} // close the menu after tapping a link
                    className="block py-4 text-base font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Account link at the bottom */}
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
    </header>
  );
}