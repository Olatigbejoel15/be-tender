// Turns 28000 into "₦28,000". Used by the product card and the product page.
export const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0, // no kobo decimals
});