// The shape of one product, exactly as the Laravel API sends it (see ProductResource).
export type Product = {
  id: number;
  slug: string;        // web-friendly name used in the address: /product/<slug>
  name: string;
  category: string;    // "Women", "Men" or "Accessories"
  price: number;       // in naira
  image: string;       // main photo (Cloudinary link)
  gallery?: string[];  // optional extra photos
  badge?: string | null;     // optional label on the photo ("New", "Best Seller")
  description: string; // short paragraph on the product page
  features: string[];  // bullet points
  fabric: string;      // material details
  care: string;        // washing instructions
  sizeLabel?: string | null; // "Size" (default), "Capacity", "Resistance"
  sizes: string[];     // the options a customer can pick
  soldOut?: string[];  // options currently unavailable
  colors: { name: string; hex: string; image?: string | null }[]; // image = this colour's photo
  isFeatured?: boolean;
  isSoldOut?: boolean;
};