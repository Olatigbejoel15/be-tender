"use client"; // uses state and loads data in the browser

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import {
  deleteProduct, getCategories, listProducts, setProductPublished,
  type AdminCategory, type AdminProduct, type Page,
} from "@/lib/adminApi";
import { naira } from "@/lib/format";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// Small coloured tag
function Pill({ tone, children }: { tone: "green" | "grey" | "red"; children: React.ReactNode }) {
  const styles = {
    green: "bg-green-100 text-green-800",
    grey: "bg-zinc-200 text-zinc-700",
    red: "bg-red-100 text-red-800",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${styles[tone]}`}>{children}</span>;
}

const units = (p: AdminProduct) => (p.stock ?? []).reduce((n, s) => n + s.quantity, 0); // total pieces on the shelf

export default function ProductsList() {
  const [searchInput, setSearchInput] = useState(""); // what is typed
  const [search, setSearch] = useState("");           // what is sent (after a short pause)
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");           // "" all, "1" live, "0" drafts
  const [availability, setAvailability] = useState(""); // "" all, "1" sold out, "0" in stock
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page<AdminProduct> | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");             // problem loading the list
  const [actionError, setActionError] = useState(""); // problem with publish / delete
  const [notice, setNotice] = useState("");           // success note
  const [attempt, setAttempt] = useState(0);          // bump to reload
  const [busyId, setBusyId] = useState<number | null>(null); // row being toggled
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fill the category filter once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}); // the filter just stays empty if this fails
  }, []);

  // Wait 400ms after typing stops, then search from page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load whenever a filter or the page changes
  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after we've moved on
    setLoading(true);
    setError("");

    listProducts({ search, category, published: status, sold_out: availability, page })
      .then((r) => {
        if (cancelled) return;
        if (r.data.length === 0 && page > 1) setPage((p) => p - 1); // deleted the last row of a page: step back
        else setResult(r);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load products."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [search, category, status, availability, page, attempt]);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(1); }; // any filter change starts at page 1

  const togglePublish = async (p: AdminProduct) => {
    setBusyId(p.id);
    setActionError("");
    setNotice("");
    try {
      await setProductPublished(p.id, p.version, !p.isPublished);
      setNotice(`${p.name} is now ${p.isPublished ? "a draft, hidden from the shop" : "live in the shop"}.`);
    } catch (e) {
      // 409 = someone else edited it first; the reload below shows the newest copy
      setActionError(e instanceof ApiError ? e.message : "Could not update the product.");
    } finally {
      setBusyId(null);
      setAttempt((a) => a + 1);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setActionError("");
    setNotice("");
    try {
      await deleteProduct(toDelete.id);
      setNotice(`${toDelete.name} was deleted.`);
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Could not delete the product.");
    } finally {
      setDeleting(false);
      setToDelete(null);
      setAttempt((a) => a + 1);
    }
  };

  const products = result?.data ?? [];
  const meta = result?.meta;
  const field = "rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-accent";
  const rowButton = "rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold transition hover:border-ink disabled:opacity-50";

  const statusPills = (p: AdminProduct) => (
    <div className="flex flex-wrap gap-1.5">
      {p.isPublished ? <Pill tone="green">Live</Pill> : <Pill tone="grey">Draft</Pill>}
      {p.isSoldOut && <Pill tone="red">Sold out</Pill>}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white">
          New product
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name" className={`${field} w-full pl-9`} />
        </div>
        <select value={category} onChange={(e) => reset(setCategory)(e.target.value)} className={field} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={status} onChange={(e) => reset(setStatus)(e.target.value)} className={field} aria-label="Status">
          <option value="">Live and drafts</option>
          <option value="1">Live only</option>
          <option value="0">Drafts only</option>
        </select>
        <select value={availability} onChange={(e) => reset(setAvailability)(e.target.value)} className={field} aria-label="Availability">
          <option value="">Any availability</option>
          <option value="1">Sold out</option>
          <option value="0">In stock</option>
        </select>
      </div>

      <p role="status" className="mt-4 min-h-5 text-sm text-green-700">{notice}</p>
      {actionError && <p role="alert" className="mt-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setAttempt((a) => a + 1)} className="rounded-full border border-red-300 px-4 py-1.5 font-semibold">Try again</button>
        </div>
      )}

      {!result && !error && <p className="mt-8 text-muted">Loading...</p>}

      {result && (
        <div className={`mt-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white px-6 py-14 text-center">
              <p className="font-semibold">No products match these filters.</p>
              <p className="mt-1 text-sm text-muted">Try a different search or clear a filter.</p>
            </div>
          ) : (
            <>
              {/* Wide screens: table */}
              <div className="hidden overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm md:block">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted uppercase">
                    <tr>
                      <th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Price</th><th className="px-5 py-3 text-right">In stock</th>
                      <th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-black/5">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Image src={p.image} alt={p.name} width={44} height={56} className="h-14 w-11 shrink-0 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <p className="font-semibold">{p.name}</p>
                              <p className="text-xs text-muted">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">{p.category}</td>
                        <td className="px-5 py-3 text-right font-medium">{naira.format(p.price)}</td>
                        <td className={`px-5 py-3 text-right font-medium ${units(p) === 0 ? "text-red-600" : ""}`}>{units(p)}</td>
                        <td className="px-5 py-3">{statusPills(p)}</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/products/${p.id}`} className={rowButton}>Edit</Link>
                            <button onClick={() => togglePublish(p)} disabled={busyId === p.id} className={rowButton}>
                              {busyId === p.id ? "..." : p.isPublished ? "Hide" : "Publish"}
                            </button>
                            <button onClick={() => setToDelete(p)} className={`${rowButton} text-red-600`}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phones: cards */}
              <ul className="space-y-3 md:hidden">
                {products.map((p) => (
                  <li key={p.id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                    <div className="flex gap-3">
                      <Image src={p.image} alt={p.name} width={56} height={70} className="h-[70px] w-14 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-muted">{p.category} · {naira.format(p.price)} · {units(p)} in stock</p>
                        <div className="mt-2">{statusPills(p)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className={rowButton}>Edit</Link>
                      <button onClick={() => togglePublish(p)} disabled={busyId === p.id} className={rowButton}>
                        {busyId === p.id ? "..." : p.isPublished ? "Hide" : "Publish"}
                      </button>
                      <button onClick={() => setToDelete(p)} className={`${rowButton} text-red-600`}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {meta && (
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
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        danger
        busy={deleting}
        title={`Delete ${toDelete?.name ?? "this product"}?`}
        message="It disappears from the shop right away. Past orders keep their own copy of the name, price and photo."
        confirmLabel="Yes, delete"
        cancelLabel="Keep product"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}