import { call } from "@/lib/authApi";

// One line of an order, as OrderItemResource sends it
export type OrderItem = {
  name: string;
  color: string;
  size: string;
  image: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

// An order, as OrderResource sends it
export type Order = {
  reference: string;
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

// What the checkout form sends. Note: no prices, the server looks those up itself.
export type CheckoutInput = {
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

export const placeOrder = (input: CheckoutInput) =>
  call<{ data: Order }>("/orders", "POST", getToken(), input).then((r) => r.data);

export const listOrders = () => call<{ data: Order[] }>("/orders", "GET", getToken()).then((r) => r.data);

export const getOrder = (reference: string) =>
  call<{ data: Order }>(`/orders/${encodeURIComponent(reference)}`, "GET", getToken()).then((r) => r.data);

// Ask Laravel to start a Paystack payment; returns the page the customer pays on
export const startPayment = (reference: string) =>
  call<{ authorizationUrl: string }>(`/orders/${encodeURIComponent(reference)}/pay`, "POST", getToken()).then(
    (r) => r.authorizationUrl
  );

// Ask Laravel to check with Paystack whether the order has been paid
export const confirmPayment = (reference: string) =>
  call<{ data: Order }>(`/orders/${encodeURIComponent(reference)}/confirm`, "POST", getToken()).then((r) => r.data);