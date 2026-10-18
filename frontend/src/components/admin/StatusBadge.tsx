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