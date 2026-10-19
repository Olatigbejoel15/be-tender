"use client"; // form state, router and API calls

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import {
  createProduct, getCategories, getProduct, updateProduct,
  type AdminCategory, type AdminProduct, type ProductInput,
} from "@/lib/adminApi";

const BADGES = ["New", "Best Seller"];                   // ProductBadge enum on the server
const SIZE_LABELS = ["Size", "Capacity", "Resistance"];  // SizeLabel enum on the server
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];

type Props = {
  product?: AdminProduct;            // present = edit mode
  onSaved?: (p: AdminProduct) => void; // edit: hands the fresh copy to the page
  onReload?: () => void;             // edit: "load latest" after a conflict
};

// A white card with a title
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function ProductForm({ product, onSaved, onReload }: Props) {
  const router = useRouter();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product ? String(product.categoryId) : "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [featuresText, setFeaturesText] = useState((product?.features ?? []).join("\n")); // one per line
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [care, setCare] = useState(product?.care ?? "");
  const [sizeLabel, setSizeLabel] = useState(product?.sizeLabel ?? "Size");
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<{ name: string; hex: string }[]>(
    product?.colors.map((c) => ({ name: c.name, hex: c.hex })) ?? [{ name: "", hex: "#1a1a1f" }]
  );
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isSoldOut, setIsSoldOut] = useState(product?.isSoldOut ?? false);
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? false); // new products start as drafts

  const [fields, setFields] = useState<Record<string, string[]>>({}); // per-field errors from Laravel
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false); // 409: someone else saved first
  const [busy, setBusy] = useState(false);

  // Fill the category dropdown once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError("Could not load categories."));
  }, []);

  // ---- sizes ----
  const addSize = (raw: string) => {
    const s = raw.trim();
    if (!s || sizes.includes(s) || sizes.length >= 12) return; // no blanks, repeats or more than 12
    setSizes([...sizes, s]);
  };

  // ---- colours ----
  const setColor = (i: number, patch: Partial<{ name: string; hex: string }>) =>
    setColors((cs) => cs.map((c, n) => (n === i ? { ...c, ...patch } : c)));
  const addColor = () => setColors((cs) => (cs.length < 20 ? [...cs, { name: "", hex: "#1a1a1f" }] : cs));
  const removeColor = (i: number) => setColors((cs) => cs.filter((_, n) => n !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    setConflict(false);

    const payload: ProductInput = {
      category_id: Number(categoryId),
      name: name.trim(),
      price: Number(price),
      badge: badge || null,
      description: description.trim(),
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean), // drop blank lines
      fabric: fabric.trim(),
      care: care.trim(),
      size_label: sizeLabel || null,
      sizes,
      colors: colors.map((c) => ({ name: c.name.trim(), hex: c.hex.toLowerCase() })),
      is_featured: isFeatured,
      is_sold_out: isSoldOut,
      is_published: isPublished,
    };

    try {
      if (product) {
        await updateProduct(product.id, product.version, payload);
        onSaved?.(await getProduct(product.id)); // reload so photos and stock stay current
      } else {
        const created = await createProduct(payload);
        router.push(`/admin/products/${created.id}`); // continue on the edit page
        return; // stay "busy" while we navigate
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setConflict(err.status === 409);
        setFields(err.fields);
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
    setBusy(false);
  };

  // ---- error helpers ----
  const fe = (k: string) => fields[k]?.[0] && <p className="mt-1 text-xs text-red-600">{fields[k][0]}</p>;
  const group = (prefix: string) => // all messages for "colors", "colors.0.name", ...
    Object.entries(fields).filter(([k]) => k === prefix || k.startsWith(prefix + ".")).flatMap(([, v]) => v);
  const groupErrors = (prefix: string) => {
    const msgs = group(prefix);
    return msgs.length > 0 && (
      <ul className="space-y-1 rounded-xl bg-red-50 p-3 text-xs text-red-700">{msgs.map((m, i) => <li key={i}>{m}</li>)}</ul>
    );
  };

  const input = "w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";
  const check = "h-4 w-4 accent-[var(--color-accent)]";

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Section title="Basics">
        <div>
          <label htmlFor="name" className={label}>Name</label>
          <input id="name" required maxLength={120} className={input} value={name} onChange={(e) => setName(e.target.value)} />
          {fe("name")}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="category" className={label}>Category</label>
            <select id="category" required className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>Choose...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {fe("category_id")}
          </div>
          <div>
            <label htmlFor="price" className={label}>Price (₦)</label>
            <input id="price" type="number" required min={100} step={1} inputMode="numeric" className={input} value={price} onChange={(e) => setPrice(e.target.value)} />
            {fe("price")}
          </div>
          <div>
            <label htmlFor="badge" className={label}>Badge</label>
            <select id="badge" className={input} value={badge} onChange={(e) => setBadge(e.target.value)}>
              <option value="">None</option>
              {BADGES.map((b) => <option key={b}>{b}</option>)}
            </select>
            {fe("badge")}
          </div>
        </div>
      </Section>

      <Section title="Details">
        <div>
          <label htmlFor="description" className={label}>Description</label>
          <textarea id="description" required rows={4} maxLength={2000} className={input} value={description} onChange={(e) => setDescription(e.target.value)} />
          {fe("description")}
        </div>
        <div>
          <label htmlFor="features" className={label}>Features (one per line, up to 10)</label>
          <textarea id="features" rows={4} className={input} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Four-way stretch\nZip pocket"} />
          {groupErrors("features")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fabric" className={label}>Fabric</label>
            <input id="fabric" required maxLength={255} className={input} value={fabric} onChange={(e) => setFabric(e.target.value)} />
            {fe("fabric")}
          </div>
          <div>
            <label htmlFor="care" className={label}>Care</label>
            <input id="care" required maxLength={500} className={input} value={care} onChange={(e) => setCare(e.target.value)} />
            {fe("care")}
          </div>
        </div>
      </Section>

      <Section title="Sizes" hint="Press Enter or comma after each one. Clothing, bottles and bands each use a different label.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="sizeLabel" className={label}>Label</label>
            <select id="sizeLabel" className={input} value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)}>
              {SIZE_LABELS.map((s) => <option key={s}>{s}</option>)}
            </select>
            {fe("size_label")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="sizeInput" className={label}>Add a {sizeLabel.toLowerCase()}</label>
            <input
              id="sizeInput" maxLength={20} className={input} value={sizeInput} placeholder="e.g. M, 500ml, Light"
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { // Enter must not submit the whole form
                  e.preventDefault();
                  addSize(sizeInput);
                  setSizeInput("");
                }
              }}
              onBlur={() => { addSize(sizeInput); setSizeInput(""); }} // a typed-but-not-entered size isn't lost
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sizes.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white py-1 pr-1 pl-3 text-sm">
              {s}
              <button type="button" aria-label={`Remove ${s}`} onClick={() => setSizes(sizes.filter((x) => x !== s))}
                className="rounded-full p-1 text-muted hover:bg-black/5 hover:text-ink"><X size={14} /></button>
            </span>
          ))}
          {sizes.length === 0 && <span className="text-sm text-muted">No sizes yet.</span>}
          <button type="button" onClick={() => setSizes(CLOTHING_SIZES)} className="text-sm font-medium underline underline-offset-4 hover:text-accent">
            Use S to XXL
          </button>
        </div>
        {groupErrors("sizes")}
      </Section>

      <Section title="Colours" hint={product ? "Photos and stock are matched by colour name. If you rename a colour, check its photo and stock afterwards." : "Photos and stock are added after you save."}>
        <ul className="space-y-3">
          {colors.map((c, i) => (
            <li key={i} className="flex items-center gap-3">
              <input
                type="color" aria-label={`Colour ${i + 1} swatch`} value={c.hex} onChange={(e) => setColor(i, { hex: e.target.value })}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
              />
              <input
                required maxLength={40} aria-label={`Colour ${i + 1} name`} placeholder="Colour name, e.g. Dark Green"
                className={input} value={c.name} onChange={(e) => setColor(i, { name: e.target.value })}
              />
              <span className="hidden w-20 shrink-0 font-mono text-xs text-muted sm:block">{c.hex}</span>
              <button type="button" aria-label={`Remove colour ${i + 1}`} disabled={colors.length === 1} onClick={() => removeColor(i)}
                className="rounded-full p-2 text-muted hover:bg-black/5 hover:text-ink disabled:opacity-30"><X size={16} /></button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={addColor} disabled={colors.length >= 20}
          className="text-sm font-medium underline underline-offset-4 hover:text-accent disabled:opacity-40">+ Add a colour</button>
        {groupErrors("colors")}
      </Section>

      <Section title="Visibility">
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className={check} checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <span><strong>Published</strong>: visible in the shop. Leave off to keep it as a draft.</span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className={check} checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <span><strong>Featured</strong>: shows in "Fresh drops" on the home page.</span>
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className={check} checked={isSoldOut} onChange={(e) => setIsSoldOut(e.target.checked)} />
          <span><strong>Sold out</strong>: manual switch that blocks purchases, whatever the stock says.</span>
        </label>
      </Section>

      {/* Conflict: someone else saved while this form was open */}
      {conflict && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <span>{error || "This product was changed by someone else."} Your edits here have not been saved.</span>
          {onReload && (
            <button type="button" onClick={onReload} className="rounded-full border border-amber-400 px-4 py-1.5 font-semibold">Load latest version</button>
          )}
        </div>
      )}
      {!conflict && error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy}
          className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition disabled:opacity-60">
          {busy ? "Saving..." : product ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="text-sm text-muted underline underline-offset-4 hover:text-accent">Back to products</Link>
      </div>
    </form>
  );
}