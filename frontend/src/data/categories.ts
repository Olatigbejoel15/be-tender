// The shape of one category
export type Category = {
  name: string;    // must match the "category" field in products.ts
  slug: string;    // used in the web address: /shop/men
  tagline: string; // small text under the name
};

export const categories: Category[] = [
  { name: "Women", slug: "women", tagline: "Leggings, bras & sets" },
  { name: "Men", slug: "men", tagline: "Tees, shorts & joggers" },
  { name: "Accessories", slug: "accessories", tagline: "Bags, bottles & bands" },
];