"use client"; // uses state and loads data in the browser

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import {
  getRevenue, getSummary, getTopProducts,
  type AnalyticsSummary, type RevenuePoint, type TopProduct,
} from "@/lib/adminApi";
import { naira } from "@/lib/format";
import RevenueChart from "@/components/admin/RevenueChart";

const RANGES = [7, 30, 90];
const STATUS_ORDER = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment", paid: "Paid", processing: "Processing",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};

// One number card
function StatCard({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <div className="mt-2 min-h-5">{children}</div>
    </div>
  );
}

// "+12.5% vs previous 30 days", or a note when there's nothing to compare with
function Change({ value, days }: { value: number | null; days: number }) {
  if (value === null) return <span className="text-xs text-muted">No earlier period to compare</span>;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-green-700" : "text-red-600"}`}>
      {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {up ? "+" : ""}{value}% vs previous {days} days
    </span>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [series, setSeries] = useState<RevenuePoint[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0); // bump to retry

  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after we've moved on
    setLoading(true);
    setError("");

    Promise.all([getSummary(days), getRevenue(days), getTopProducts(days, 5)])
      .then(([s, r, t]) => {
        if (cancelled) return;
        setSummary(s);
        setSeries(r);
        setTop(t);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load the dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [days, attempt]);

  const maxStatus = summary ? Math.max(...Object.values(summary.ordersByStatus), 1) : 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-1 rounded-full border border-black/10 bg-white p-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${days === r ? "bg-accent text-white" : "hover:bg-black/5"}`}>
              {r} days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setAttempt((a) => a + 1)} className="rounded-full border border-red-300 px-4 py-1.5 font-semibold">Try again</button>
        </div>
      )}

      {!summary && !error && <p className="mt-8 text-muted">Loading...</p>}

      {summary && (
        <div className={`mt-6 space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {/* Headline numbers */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Revenue" value={naira.format(summary.revenue)}>
              <Change value={summary.change.revenuePercent} days={days} />
            </StatCard>
            <StatCard label="Orders" value={String(summary.orders)}>
              <Change value={summary.change.ordersPercent} days={days} />
            </StatCard>
            <StatCard label="Average order" value={naira.format(summary.averageOrderValue)}>
              <span className="text-xs text-muted">Includes delivery fees</span>
            </StatCard>
            <StatCard label="Running low" value={String(summary.lowStockOptions)}>
              <span className="text-xs text-muted">size / colour options to restock</span>
            </StatCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Daily revenue */}
            <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="font-semibold">Revenue per day</h2>
              <p className="text-xs text-muted">Paid, processing, shipped and delivered orders</p>
              <div className="mt-4"><RevenueChart points={series} /></div>
            </section>

            {/* Orders by status (all time) */}
            <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Orders by status</h2>
              <p className="text-xs text-muted">All time</p>
              <ul className="mt-4 space-y-3">
                {STATUS_ORDER.map((s) => {
                  const n = summary.ordersByStatus[s] ?? 0;
                  return (
                    <li key={s}>
                      <div className="flex justify-between text-sm"><span>{STATUS_LABEL[s]}</span><span className="font-semibold">{n}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-black/5">
                        <div className={`h-2 rounded-full ${s === "cancelled" ? "bg-muted" : "bg-accent"}`}
                          style={{ width: n > 0 ? `${Math.max((n / maxStatus) * 100, 3)}%` : "0%" }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Best sellers */}
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Top products</h2>
            <p className="text-xs text-muted">Items only: delivery fees are not included here</p>
            {top.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No sales in this period yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted uppercase">
                    <tr><th className="py-2 pr-4">#</th><th className="py-2 pr-4">Product</th><th className="py-2 pr-4 text-right">Units</th><th className="py-2 text-right">Revenue</th></tr>
                  </thead>
                  <tbody>
                    {top.map((p, i) => (
                      <tr key={p.productId} className="border-t border-black/5">
                        <td className="py-3 pr-4 text-muted">{i + 1}</td>
                        <td className="py-3 pr-4 font-medium">{p.name}</td>
                        <td className="py-3 pr-4 text-right">{p.units}</td>
                        <td className="py-3 text-right">{naira.format(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}