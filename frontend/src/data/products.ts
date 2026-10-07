// The shape of one product. TypeScript warns us if we forget a field.
export type Product = {
  id: number;
  slug: string;        // web-friendly name used in the address: /product/<slug>
  name: string;
  category: string;    // must match a category name exactly: "Women", "Men" or "Accessories"
  price: number;       // in naira
  image: string;       // main photo, path inside public/
  gallery?: string[];  // optional extra photos (shown as thumbnails on the product page)
  badge?: string;      // optional label on the photo ("New", "Best Seller")
  description: string; // short paragraph on the product page
  features: string[];  // bullet points
  fabric: string;      // material details
  care: string;        // washing instructions
  sizeLabel?: string;  // what to call the options: "Size" (default), "Capacity", "Resistance"
  sizes: string[];     // the options a customer can pick
  soldOut?: string[];  // options currently unavailable (shown crossed out)
  colors: { name: string; hex: string }[]; // hex = the color of the round dot
};

// SAMPLE DATA: replace descriptions, fabric and care with your real product details.
// In Phase 9 this list comes from the Laravel API.
export const products: Product[] = [
  {
    id: 1,
    slug: "core-seamless-leggings",
    name: "Core Seamless Leggings",
    category: "Women",
    price: 28000,
    image: "/products/product-1.jpg",
    badge: "New",
    description: "High-waisted seamless leggings with a sculpting, squat-proof knit. Soft against the skin and light enough for Lagos heat.",
    features: ["High-rise, no-dig waistband", "Squat-proof, opaque fabric", "Seamless for zero chafing", "Hidden pocket at the waistband"],
    fabric: "Nylon and elastane blend (sample: confirm your exact fabric).",
    care: "Machine wash cold with similar colors. Do not use fabric softener. Air dry.",
    sizes: ["XS", "S", "M", "L", "XL"],
    soldOut: ["XL"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "Mocha", hex: "#7a5c4a" },
      { name: "Sage", hex: "#9caf9a" },
    ],
  },
  {
    id: 2,
    slug: "sculpt-sports-bra",
    name: "Sculpt Sports Bra",
    category: "Women",
    price: 18000,
    image: "/products/product-2.jpg", // swapped to match the correct photo
    badge: "Best Seller",
    description: "A supportive, medium-impact sports bra with a smooth, sculpting fit. Holds firm through cardio and lifting while staying comfortable.",
    features: ["Medium support", "Built-in removable cups", "Racerback for free arm movement", "Breathable, quick-dry fabric"],
    fabric: "Nylon and elastane blend (sample: confirm your exact fabric).",
    care: "Machine wash cold in a laundry bag. Do not tumble dry.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "Sand", hex: "#d9c7ae" },
    ],
  },
  {
    id: 3,
    slug: "pump-cover-tee",
    name: "Pump Cover Tee",
    category: "Men",
    price: 15000,
    image: "/products/product-3.jpg",
    description: "A relaxed training tee with a cropped, boxy cut that shows off your work and stays out of the way on heavy sets.",
    features: ["Relaxed, boxy fit", "Soft, breathable cotton blend", "Reinforced shoulder seams", "Tag-free neck for comfort"],
    fabric: "Cotton and polyester blend (sample: confirm your exact fabric).",
    care: "Machine wash cold. Tumble dry low.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "Stone", hex: "#c9c2b6" },
      { name: "Navy", hex: "#14305f" },
    ],
  },
  {
    id: 4,
    slug: "flex-training-shorts",
    name: "Flex Training Shorts",
    category: "Men",
    price: 16500,
    image: "/products/product-4.jpg", // swapped to match the correct photo
    badge: "New",
    description: "Lightweight training shorts with four-way stretch, made for leg day, sprints and everything between.",
    features: ["Four-way stretch", "Zip pocket for keys and cards", "Quick-dry, lightweight fabric", "Elastic drawcord waist"],
    fabric: "Polyester and elastane blend (sample: confirm your exact fabric).",
    care: "Machine wash cold. Do not iron.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    soldOut: ["S"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "Navy", hex: "#14305f" },
    ],
  },
  {
    id: 5,
    slug: "aura-biker-shorts",
    name: "Aura Biker Shorts",
    category: "Women",
    price: 14500,
    image: "/products/product-5.jpg",
    description: "Smooth, high-waisted biker shorts that stay in place through squats, runs and studio classes.",
    features: ["High-rise waistband", "Stay-put leg grip", "Squat-proof fabric", "Soft, buttery feel"],
    fabric: "Nylon and elastane blend (sample: confirm your exact fabric).",
    care: "Machine wash cold. Air dry.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "Sage", hex: "#9caf9a" },
    ],
  },
  {
    id: 6,
    slug: "tempo-joggers",
    name: "Tempo Joggers",
    category: "Men",
    price: 22000,
    image: "/products/product-6.jpg",
    description: "Tapered joggers that work in the gym and out of it. Soft, structured and comfortable all day.",
    features: ["Tapered leg with ankle cuffs", "Two zip pockets", "Brushed inside for softness", "Adjustable drawcord"],
    fabric: "Cotton and polyester blend (sample: confirm your exact fabric).",
    care: "Machine wash cold. Tumble dry low.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", hex: "#3a3d45" },
      { name: "Black", hex: "#1a1a1f" },
    ],
  },
  {
    id: 7,
    slug: "studio-gym-duffel",
    name: "Studio Gym Duffel",
    category: "Accessories",
    price: 25000,
    image: "/products/product-7.jpg",
    badge: "New",
    description: "A roomy duffel with a separate shoe compartment, sized for a full session and a quick change afterwards.",
    features: ["Ventilated shoe compartment", "Water-resistant base", "Padded shoulder strap", "Zip side pocket"],
    fabric: "Water-resistant polyester (sample: confirm your exact material).",
    care: "Spot clean with a damp cloth.",
    sizes: ["One size"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "Sand", hex: "#d9c7ae" },
    ],
  },
  {
    id: 8,
    slug: "hydra-steel-bottle",
    name: "Hydra Steel Bottle",
    category: "Accessories",
    price: 9000,
    image: "/products/product-8.jpg",
    description: "An insulated steel bottle that keeps drinks cold through your whole session and the ride home.",
    features: ["Double-wall insulation", "Leak-proof lid", "Fits most cup holders", "Wide mouth for ice"],
    fabric: "Stainless steel (sample: confirm your exact material).",
    care: "Hand wash. Not dishwasher safe.",
    sizeLabel: "Capacity",
    sizes: ["500ml", "750ml"],
    colors: [
      { name: "Black", hex: "#1a1a1f" },
      { name: "White", hex: "#f2f2f0" },
      { name: "Sage", hex: "#9caf9a" },
    ],
  },
  {
    id: 9,
    slug: "power-resistance-bands",
    name: "Power Resistance Bands",
    category: "Accessories",
    price: 12000,
    image: "/products/product-9.jpg",
    description: "A set of looped resistance bands for glute work, warm-ups and travel workouts.",
    features: ["Non-slip fabric finish", "Doesn't roll up during use", "Three resistance levels", "Comes with a carry pouch"],
    fabric: "Fabric-covered latex (sample: confirm your exact material).",
    care: "Wipe clean. Air dry away from direct sunlight.",
    sizeLabel: "Resistance",
    sizes: ["Light", "Medium", "Heavy"],
    colors: [
      { name: "Sage", hex: "#9caf9a" },
      { name: "Sand", hex: "#d9c7ae" },
    ],
  },
];