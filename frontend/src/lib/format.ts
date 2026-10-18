// Turns 28000 into "₦28,000". Used by the product card and the product page.
export const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0, // no kobo decimals
});

// "2026-10-17" -> "17 Oct" (used on charts and tables)
export const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });