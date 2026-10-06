// The shape of one review
export type Testimonial = {
  name: string;
  location: string;
  text: string;
  rating: number;    // 1 to 5
  productId: number; // must match an "id" in products.ts: this is what they bought
};

// SAMPLE TEXT: replace these with real customer reviews before you go live.
export const testimonials: Testimonial[] = [
  { name: "Amaka O.", location: "Lagos", rating: 5, productId: 1,
    text: "The leggings stay put through squats and the fabric stays cool. I wear them everywhere now." },
  { name: "Tunde A.", location: "Abuja", rating: 5, productId: 3,
    text: "Fits well, dries quickly and the quality is clear. Delivery was quicker than I expected." },
  { name: "Chioma E.", location: "Port Harcourt", rating: 5, productId: 2,
    text: "Finally a sports bra that holds firm and stays comfortable. Ordering the next set already." },
  { name: "Ibrahim S.", location: "Kano", rating: 4, productId: 4,
    text: "Light shorts with room to move. Great for leg day, and they look good too." },
  { name: "Ngozi U.", location: "Enugu", rating: 5, productId: 5,
    text: "The biker shorts don't ride up and the fit is flattering. I bought a second pair." },
  { name: "Femi B.", location: "Ibadan", rating: 5, productId: 6,
    text: "Comfortable joggers I can wear to the gym and out afterwards. Solid stitching." },
  { name: "Zainab M.", location: "Lagos", rating: 5, productId: 7,
    text: "Plenty of space for my shoes, towel and gear, and it looks neat. Easy to carry." },
];