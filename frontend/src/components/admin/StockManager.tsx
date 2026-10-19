"use client"; // editable grid with state

import { useMemo, useState } from "react";
import { ApiError } from "@/lib/authApi";
import { saveStock, type AdminProduct } from "@/lib/adminApi";

const LOW = 5;        // keep in step with shop.low_stock_threshold in config/shop.php
const MAX = 100000;   // the server's upper limit
const CHUNK = 200;    // the server accepts 200 entries per request

type Props = { product: AdminProduct; onChanged: () => Promise<void> };

const valid = (v: string) => /^\d+$/.test(v) && Number(v) <= MAX; // whole number, 0 to MAX

export default function StockManager({ product, onChanged }: Props) {
  const [draft, setDraft] = useState<Record<string, string>>({}); // changed cells only, key "colourIndex:sizeIndex"
  const [fill, setFill] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const colors = product.colors;
  const sizes = product.sizes;

  // Saved quantities, looked up by colour name + size
  const saved = useMemo(() => {
    const m = new Map<string, number>();
    (product.stock ?? []).forEach((s) => m.set(`${s.color}\u0000${s.size}`, s.quantity));
    return m;
  }, [product.stock]);
  const original = (colour: string, size: string) => saved.get(`${colour}\u0000${size}`) ?? 0; // no row = 0

  const setCell = (ci: number, si: number, value: string) => {
    const key = `${ci}:${si}`;
    const orig = String(original(colors[ci].name, sizes[si]));
    setNotice("");
    setDraft((d) => {
      const next = { ...d };
      if (value === orig) delete next[key]; // back to the saved number: no longer a change
      else next[key] = value;
      return next;
    });
  };

  // Fill every cell with one number (handy for a new product)
  const applyFill = () => {
    if (!valid(fill)) return;
    const next: Record<string, string> = {};
    colors.forEach((c, ci) => sizes.forEach((s, si) => {
      if (String(original(c.name, s)) !== fill) next[`${ci}:${si}`] = fill;
    }));
    setDraft(next);
    setNotice("");
  };

  const changed = Object.keys(draft).length;
  const hasInvalid = Object.values(draft).some((v) => !valid(v));

  // Total pieces, counting unsaved edits too
  const total = colors.reduce((sum, c, ci) => sum + sizes.reduce((n, s, si) => {
    const v = draft[`${ci}:${si}`];
    return n + (v !== undefined && valid(v) ? Number(v) : original(c.name, s));
  }, 0), 0);

  const save = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    const entries = Object.entries(draft).map(([key, v]) => {
      const [ci, si] = key.split(":").map(Number);
      return { color: colors[ci].name, size: sizes[si], set: Number(v) };
    });

    try {
      for (let i = 0; i < entries.length; i += CHUNK) {
        await saveStock(product.id, entries.slice(i, i + CHUNK)); // big grids go in several requests
      }
      await onChanged();
      setDraft({});
      setNotice(`Stock saved (${entries.length} cell${entries.length === 1 ? "" : "s"} changed).`);
    } catch (e) {
      setError(e instanceof ApiError ? (Object.values(e.fields)[0]?.[0] ?? e.message) : "Could not save the stock. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Stock</h2>
        <p className="text-sm text-muted">{total} piece{total === 1 ? "" : "s"} in total</p>
      </div>
      <p className="mt-1 text-xs text-muted">
        Type the exact number on the shelf. Red = 0 (sold out), amber = {LOW} or fewer. Customers only ever see sold out or available.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-black/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase">
              <th className="px-3 py-2 text-left">Colour</th>
              {sizes.map((s) => <th key={s} className="px-2 py-2 text-center">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {colors.map((c, ci) => (
              <tr key={c.name} className="border-t border-black/5">
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="mr-2 inline-block h-3 w-3 rounded-full border border-black/20 align-middle" style={{ background: c.hex }} />
                  {c.name}
                </td>
                {sizes.map((s, si) => {
                  const key = `${ci}:${si}`;
                  const shown = draft[key] ?? String(original(c.name, s));
                  const n = Number(shown);
                  const tone = !valid(shown)
                    ? "border-red-500 bg-red-50"
                    : draft[key] !== undefined
                      ? "border-accent"                                  // edited, not saved yet
                      : n === 0 ? "border-red-200 bg-red-50 text-red-700"
                      : n <= LOW ? "border-amber-300 bg-amber-50"
                      : "border-ink/15";
                  return (
                    <td key={s} className="px-1.5 py-1.5 text-center">
                      <input
                        inputMode="numeric" aria-label={`${c.name} ${s} stock`} value={shown}
                        onChange={(e) => setCell(ci, si, e.target.value.trim())}
                        className={`w-16 rounded-lg border bg-white px-2 py-1.5 text-center outline-none focus:border-accent ${tone}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          inputMode="numeric" aria-label="Quantity for every cell" placeholder="e.g. 20" value={fill} onChange={(e) => setFill(e.target.value.trim())}
          className="w-24 rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="button" onClick={applyFill} disabled={!valid(fill)}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold transition hover:border-ink disabled:opacity-40">
          Apply to all cells
        </button>

        <span className="flex-1" />

        {changed > 0 && (
          <button type="button" onClick={() => setDraft({})} disabled={saving} className="text-sm text-muted underline underline-offset-4 hover:text-accent">
            Discard changes
          </button>
        )}
        <button type="button" onClick={save} disabled={saving || changed === 0 || hasInvalid}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50">
          {saving ? "Saving..." : changed > 0 ? `Save stock (${changed})` : "Save stock"}
        </button>
      </div>

      <p role="status" className="mt-3 min-h-5 text-sm text-green-700">{notice}</p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </section>
  );
}