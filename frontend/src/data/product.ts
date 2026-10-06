// The shape of one product. TypeScript will warn us if we forget a field.
export type Product = {
  id: number;
  name: string;
  category: string;
  price: number; // in naira, as a plain number
  image: string; // path inside the public/ folder
  badge?: string; // the ? means optional: only some products have a badge
};

// Temporary product list. In Phase 9 this will come from the Laravel API.
export const products: Product[] = [
  { id: 1, name: "Core Seamless Leggings", category: "Women", price: 28000, image: "/products/product-1.jpg", badge: "New" },
  { id: 2, name: "Sculpt Sports Bra", category: "Women", price: 18000, image: "/products/product-2.jpg", badge: "Best Seller" },
  { id: 3, name: "Pump Cover Tee", category: "Men", price: 15000, image: "/products/product-3.jpg" },
  { id: 4, name: "Flex Training Shorts", category: "Men", price: 16500, image: "/products/product-4.jpg", badge: "New" },
];