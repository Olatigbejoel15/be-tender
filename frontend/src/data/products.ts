export type Product = {
  id: number;
  name: string;
  category: string; // must match a category name exactly: "Women", "Men" or "Accessories"
  price: number;    // in naira
  image: string;    // path inside public/
  badge?: string;   // optional label on the photo
};

// 9 products: 3 per category. In Phase 9 this list comes from the Laravel API.
export const products: Product[] = [
  { id: 1, name: "Core Seamless Leggings", category: "Women", price: 28000, image: "/products/product-1.jpg", badge: "New" },
  { id: 2, name: "Sculpt Sports Bra", category: "Women", price: 18000, image: "/products/product-4.jpg", badge: "Best Seller" },
  { id: 3, name: "Pump Cover Tee", category: "Men", price: 15000, image: "/products/product-3.jpg" },
  { id: 4, name: "Flex Training Shorts", category: "Men", price: 16500, image: "/products/product-2.jpg", badge: "New" },
  { id: 5, name: "Aura Biker Shorts", category: "Women", price: 14500, image: "/products/product-5.jpg" },
  { id: 6, name: "Tempo Joggers", category: "Men", price: 22000, image: "/products/product-6.jpg" },
  { id: 7, name: "Studio Gym Duffel", category: "Accessories", price: 25000, image: "/products/product-7.jpg", badge: "New" },
  { id: 8, name: "Hydra Steel Bottle", category: "Accessories", price: 9000, image: "/products/product-8.jpg" },
  { id: 9, name: "Power Resistance Bands", category: "Accessories", price: 12000, image: "/products/product-9.jpg" },
];