import { call } from "@/lib/authApi";

// One line of an order, as OrderItemResource sends it
export type OrderItem = {
  name: string;
  color: string;
  size: string;
  image: string | null; // an order line can have no photo
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

// An order, as OrderResource sends it
export type Order = {
  reference: string;
  email: string; // where receipts go
  status: string;
  statusLabel: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
};

// What the checkout form sends. No prices: the server looks those up itself.
export type CheckoutInput = {
  email?: string; // guests only; signed-in customers use their account email
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  items: { product_id: number; color: string; size: string; quantity: number }[];
};

// Read the login token saved by AuthContext (same key)
export const getToken = (): string | null => {
  try {
    return localStorage.getItem("be-tender-token");
  } catch {
    return null;
  }
};

// A guest's email, kept for this tab only, so the Paystack return page can prove who they are
const guestKey = (reference: string) => `be-tender-guest-${reference}`;

export const rememberGuestEmail = (reference: string, email: string) => {
  try {
    sessionStorage.setItem(guestKey(reference), email);
  } catch {
    /* storage blocked: the order page will just ask for the email */
  }
};

export const getGuestEmail = (reference: string): string | null => {
  try {
    return sessionStorage.getItem(guestKey(reference));
  } catch {
    return null; // also the answer on the server, where there is no sessionStorage
  }
};

const ref = (reference: string) => encodeURIComponent(reference);

// The key identifies ONE checkout attempt, so a repeat can't create a second order
export const placeOrder = (input: CheckoutInput, idempotencyKey: string) =>
  call<{ data: Order }>("/orders", "POST", getToken(), input, { "Idempotency-Key": idempotencyKey }).then((r) => r.data);

export const listOrders = () => call<{ data: Order[] }>("/orders", "GET", getToken()).then((r) => r.data);

// email = null: signed-in customer (token). With an email: guest proves ownership (no token).
export const getOrder = (reference: string, email: string | null = null) =>
  (email
    ? call<{ data: Order }>(`/orders/${ref(reference)}/lookup`, "POST", null, { email })
    : call<{ data: Order }>(`/orders/${ref(reference)}`, "GET", getToken())
  ).then((r) => r.data);

// Ask Laravel to start a Paystack payment; returns the page the customer pays on
export const startPayment = (reference: string, email: string | null = null) =>
  call<{ authorizationUrl: string }>(
    `/orders/${ref(reference)}/pay`, "POST", email ? null : getToken(), email ? { email } : undefined
  ).then((r) => r.authorizationUrl);

// Ask Laravel to check with Paystack whether the order has been paid
export const confirmPayment = (reference: string, email: string | null = null) =>
  call<{ data: Order }>(
    `/orders/${ref(reference)}/confirm`, "POST", email ? null : getToken(), email ? { email } : undefined
  ).then((r) => r.data);