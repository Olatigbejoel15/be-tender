"use client"; // uses state and browser storage, so it runs in the browser

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// One line in the cart
export type CartItem = {
  key: string;       // unique id for this exact combination: product + color + size
  productId: number;
  slug: string;      // used to link back to the product page
  name: string;
  image: string;
  price: number;     // price per item, in naira
  color: string;
  size: string;
  qty: number;
};

// What the product page sends when adding (the key and quantity merging are handled here)
type NewItem = Omit<CartItem, "key">;

// Everything other components can read or call
type CartContextValue = {
  items: CartItem[];
  count: number;       // total number of items (for the navbar badge)
  subtotal: number;    // total price in naira
  isOpen: boolean;     // is the drawer showing?
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: NewItem) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "be-tender-cart"; // the name the cart is saved under in the browser
const MAX_QTY = 10; // most of one item per line

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false); // true once we've read the saved cart

  // On first load: read the saved cart from the browser
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setItems(parsed); // only accept a list
      }
    } catch {
      /* storage blocked or the data is damaged: start with an empty cart */
    }
    setLoaded(true);
  }, []);

  // Whenever the cart changes: save it. We wait until "loaded", so we don't overwrite the saved cart with an empty one.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage blocked: the cart still works, it just won't survive a refresh */
    }
  }, [items, loaded]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Add an item. If the same product + color + size is already there, increase its quantity instead.
  const addItem = useCallback((item: NewItem) => {
    const key = `${item.productId}-${item.color}-${item.size}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + item.qty) } : i
        );
      }
      return [...prev, { ...item, key }];
    });
    setIsOpen(true); // show the drawer so the customer sees it worked
  }, []);

  // Change a quantity. Going below 1 removes the line.
  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty < 1
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i))
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  // Totals are calculated from the items, so they can never get out of sync.
  // useMemo means "only recalculate when items change".
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, isOpen, openCart, closeCart, addItem, setQty, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

// The one-line way for any component to use the cart: const { count } = useCart();
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}