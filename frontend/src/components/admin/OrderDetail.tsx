"use client"; // uses state, the URL and the API

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import { changeOrderStatus, getOrder, type AdminOrder } from "@/lib/adminApi";
import { formatDateTime, naira } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// A white card with a title
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function OrderDetail() {
  const { reference } = useParams<{ reference: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");        // loading problem
  const [choice, setChoice] = useState("");      // chosen next status
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");    // success note
  const [formError, setFormError] = useState(""); // problem changing status
  const [confirming, setConfirming] = useState(false); // cancel dialog open?

  const load = useCallback(async () => {
    try {
      const o = await getOrder(reference);
      setOrder(o);
      setChoice(o.nextStatuses[0]?.value ?? ""); // default to the first allowed move
      setError("");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 404 ? "This order does not exist." : e instanceof ApiError ? e.message : "Could not load the order.");
    }
  }, [reference]);

  useEffect(() => {
    load();
  }, [load]);

    // Does the actual update
  const run = async () => {
    if (!order || !choice) return;
    const label = order.nextStatuses.find((s) => s.value === choice)?.label ?? choice;

    setSaving(true);
    setFormError("");
    setMessage("");
    try {
      await changeOrderStatus(order.reference, choice, note);
      setNote("");
      setMessage(`Status changed to ${label}.`);
    } catch (e) {
      setFormError(e instanceof ApiError ? (e.fields.status?.[0] ?? e.message) : "Could not update the order.");
    } finally {
      await load(); // always show what the server really holds
      setSaving(false);
      setConfirming(false);
    }
  };

  // Cancelling asks first (in the dialog); every other move goes straight through
  const submit = () => {
    if (choice === "cancelled") setConfirming(true);
    else run();
  };

  if (error) {
    return (
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent"><ArrowLeft size={16} /> All orders</Link>
        <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      </div>
    );
  }
  if (!order) return <p className="text-muted">Loading...</p>;

  const history = order.history ?? [];
  const delivery = order.deliveryFee === 0 ? "Free" : naira.format(order.deliveryFee);

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent"><ArrowLeft size={16} /> All orders</Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{order.reference}</h1>
        <StatusBadge status={order.status} label={order.statusLabel} />
      </div>
      <p className="mt-1 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: what was bought, where it goes */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Items">
            <ul className="divide-y divide-black/5">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} width={56} height={70} className="h-[70px] w-14 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-[70px] w-14 shrink-0 rounded-lg bg-sand" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-muted">{it.color} / {it.size}</p>
                    <p className="text-xs text-muted">{naira.format(it.unitPrice)} x {it.quantity}</p>
                  </div>
                  <p className="font-semibold">{naira.format(it.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{naira.format(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{delivery}</dd></div>
              <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{naira.format(order.total)}</dd></div>
            </dl>
          </Card>

          <Card title="Delivery address">
            <p className="font-medium">{order.recipientName}</p>
            <p className="text-sm text-muted">{order.phone}</p>
            <p className="mt-2 text-sm">{order.address}, {order.city}, {order.state}</p>
          </Card>
        </div>

        {/* Right: change status, customer, history */}
        <div className="space-y-6">
          <Card title="Update status">
            {order.nextStatuses.length === 0 ? (
              <p className="text-sm text-muted">This order is {order.statusLabel.toLowerCase()}: no further changes are possible.</p>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold tracking-wide uppercase" htmlFor="next">Move to</label>
                <select id="next" value={choice} onChange={(e) => setChoice(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent">
                  {order.nextStatuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <label className="block text-xs font-semibold tracking-wide uppercase" htmlFor="note">Note (optional)</label>
                <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={250} rows={3}
                  placeholder="e.g. Handed to DHL, tracking 12345"
                  className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent" />

                {choice === "cancelled" && order.paidAt && (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    This order is already paid. Cancelling does not refund the customer automatically: refund it in your Paystack dashboard.
                  </p>
                )}

                <button onClick={submit} disabled={saving || !choice}
                  className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60">
                  {saving ? "Saving..." : "Update status"}
                </button>
              </div>
            )}
            <p role="status" className="mt-3 min-h-5 text-sm text-green-700">{message}</p>
            <p role="alert" className="text-sm text-red-600">{formError}</p>
          </Card>

          <Card title="Customer and payment">
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-muted">Customer</dt><dd className="font-medium">{order.customer.name}</dd></div>
              <div><dt className="text-xs text-muted">Email</dt>
                <dd><a href={`mailto:${order.customer.email}`} className="underline underline-offset-4 hover:text-accent">{order.customer.email}</a></dd></div>
              <div><dt className="text-xs text-muted">Payment reference</dt><dd className="font-mono text-xs break-all">{order.paymentReference ?? "None yet"}</dd></div>
              <div><dt className="text-xs text-muted">Paid</dt><dd>{order.paidAt ? formatDateTime(order.paidAt) : "Not paid"}</dd></div>
            </dl>
          </Card>

          <Card title="History">
            <ol className="relative border-l border-black/10 pl-5">
              {history.map((h, i) => (
                <li key={i} className="relative pb-5 last:pb-0">
                  <span className="absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full bg-accent" />
                  <p className="text-sm font-semibold">{h.toLabel}</p>
                  {h.note && <p className="text-sm text-muted">{h.note}</p>}
                  <p className="text-xs text-muted">{h.by ?? "System"} · {formatDateTime(h.createdAt)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
            <ConfirmDialog
        open={confirming}
        danger
        busy={saving}
        title="Cancel this order?"
        message={
          order.paidAt
            ? "This order is already paid. Cancelling puts its stock back on the shelf and emails the customer, but does not refund them automatically: refund it in your Paystack dashboard."
            : "Its stock goes back on the shelf and the customer is emailed. This cannot be undone."
        }
        confirmLabel="Yes, cancel order"
        onConfirm={run}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}