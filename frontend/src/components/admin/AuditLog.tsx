"use client"; // state, filters and loading in the browser

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/authApi";
import { listAuditLogs, type AuditEntry, type Page } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/format";

const ACTIONS: [string, string][] = [
  ["product.created", "Product created"],
  ["product.updated", "Product updated"],
  ["product.deleted", "Product deleted"],
  ["product.photo_added", "Photo added"],
  ["product.photo_removed", "Photo removed"],
  ["stock.updated", "Stock updated"],
  ["staff.created", "Staff created"],
  ["staff.promoted", "Staff promoted"],
  ["staff.updated", "Staff updated"],
];
const ACTION_LABEL = Object.fromEntries(ACTIONS);

// A value from a change, in plain words
const show = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "empty";
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "number") return v.toLocaleString("en-NG");
  if (typeof v === "object") { const s = JSON.stringify(v); return s.length > 60 ? s.slice(0, 57) + "..." : s; }
  return String(v);
};

export default function AuditLog() {
  const [action, setAction] = useState("");
  const [subject, setSubject] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<AuditEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after we've moved on
    setLoading(true);
    setError("");

    listAuditLogs({ action, subject_type: subject, page })
      .then((r) => { if (!cancelled) setResult(r); })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load the audit log."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [action, subject, page, attempt]);

  const entries = result?.data ?? [];
  const meta = result?.meta;
  const field = "rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Audit log</h1>
      <p className="mt-1 text-sm text-muted">Who changed what, newest first.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className={field} aria-label="Action">
          <option value="">All actions</option>
          {ACTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }} className={field} aria-label="About">
          <option value="">Products and users</option>
          <option value="product">Products only</option>
          <option value="user">Users only</option>
        </select>
      </div>

      {error && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setAttempt((a) => a + 1)} className="rounded-full border border-red-300 px-4 py-1.5 font-semibold">Try again</button>
        </div>
      )}

      {!result && !error && <p className="mt-8 text-muted">Loading...</p>}

      {result && (
        <div className={`mt-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white px-6 py-14 text-center">
              <p className="font-semibold">No entries match these filters.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
              {entries.map((e) => (
                <li key={e.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                      {ACTION_LABEL[e.action] ?? e.action}
                    </span>
                    <span className="text-xs text-muted">{formatDateTime(e.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{e.summary}</p>

                  {e.changes && (
                    <ul className="mt-1 space-y-0.5 text-xs text-muted">
                      {Object.entries(e.changes).map(([name, c]) => (
                        <li key={name}>
                          <span className="font-medium text-ink">{name.replace(/_/g, " ")}</span>: {show(c.from)}{" "}
                          <span aria-hidden>→</span><span className="sr-only">changed to</span> {show(c.to)}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-2 text-xs text-muted">By {e.by}{e.ip ? ` · ${e.ip}` : ""}</p>
                </li>
              ))}
            </ul>
          )}

          {meta && meta.last_page > 1 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <p>Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total}</p>
              <div className="flex items-center gap-2">
                <button disabled={meta.current_page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="rounded-full border border-ink/15 px-4 py-1.5 font-medium text-ink disabled:opacity-40">Previous</button>
                <span>Page {meta.current_page} of {meta.last_page}</span>
                <button disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)}
                  className="rounded-full border border-ink/15 px-4 py-1.5 font-medium text-ink disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}