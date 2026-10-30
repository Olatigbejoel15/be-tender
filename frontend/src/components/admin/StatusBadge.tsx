const STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-sky-100 text-sky-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-zinc-200 text-zinc-700",
};

export default function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STYLES[status] ?? "bg-zinc-200 text-zinc-700"}`}>
      {label}
    </span>
  );
}

// Small grey tag for orders placed without an account
export function GuestBadge() {
  return (
    <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 align-middle text-[10px] font-semibold text-zinc-700 uppercase">
      Guest
    </span>
  );
}

// Small red tag for the orders list: money is owed back to the customer
export function RefundBadge() {
  return (
    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 align-middle text-[10px] font-semibold text-red-800 uppercase">
      Refund needed
    </span>
  );
}

// Full-width warning for the order page, with what to do next
export function RefundNotice({ amount, paymentReference }: { amount: string; paymentReference: string | null }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-semibold">Refund needed</p>
      <p className="mt-1">
        This order was cancelled, but the customer paid for it anyway. Refund {amount}
        {paymentReference && <> for payment <span className="font-mono break-all">{paymentReference}</span></>} in
        the Paystack dashboard. The customer and the team have already been emailed.
      </p>
    </div>
  );
}