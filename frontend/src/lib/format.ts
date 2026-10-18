// Turns 28000 into "₦28,000". Used by the product card and the product page.
export const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0, // no kobo decimals
});

// "2026-10-17" -> "17 Oct" (used on charts and tables)
export const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short" });

// "2026-10-17T10:09:30+00:00" -> "17 Oct 2026, 11:09 am" (shown in Lagos time)
export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });