import { formatDay, naira } from "@/lib/format";
import type { RevenuePoint } from "@/lib/adminApi";

const W = 720; // drawing width (the SVG scales to its container)
const H = 200; // drawing height

export default function RevenueChart({ points }: { points: RevenuePoint[] }) {
  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.revenue), 0);
  const slot = W / points.length;   // space per day
  const barW = slot * 0.7;          // bar width inside its slot

  return (
    <div>
      <p className="text-xs text-muted">Best day: {naira.format(max)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Daily revenue" className="mt-2 h-52 w-full">
        <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} stroke="currentColor" strokeOpacity="0.15" />
        {points.map((p, i) => {
          const h = max > 0 ? Math.max((p.revenue / max) * (H - 8), p.revenue > 0 ? 3 : 0) : 0; // tiny sales stay visible
          return (
            <rect key={p.date} x={i * slot + (slot - barW) / 2} y={H - h} width={barW} height={h} rx="2"
              className="fill-accent transition-opacity hover:opacity-70">
              <title>{`${formatDay(p.date)}: ${naira.format(p.revenue)} (${p.orders} ${p.orders === 1 ? "order" : "orders"})`}</title>
            </rect>
          );
        })}
      </svg>
      {/* First, middle and last day under the chart */}
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{formatDay(points[0].date)}</span>
        <span>{formatDay(points[Math.floor(points.length / 2)].date)}</span>
        <span>{formatDay(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}