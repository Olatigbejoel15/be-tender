import { products, type Product } from "@/data/products";

// Returns the products that match what the visitor typed.
// Every word they typed must appear somewhere in the product's name, category, description or colors.
export function searchProducts(query: string): Product[] {
  // "Sports  Bra" -> ["sports", "bra"] (lowercase, split on spaces, drop empty pieces)
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return []; // nothing typed, nothing found

  return products.filter((p) => {
    // One lowercase block of text to look inside
    const text = `${p.name} ${p.category} ${p.description} ${p.colors.map((c) => c.name).join(" ")}`.toLowerCase();
    return words.every((w) => text.includes(w)); // all words must be found
  });
}