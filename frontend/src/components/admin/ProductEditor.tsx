"use client"; // reads the URL and loads data in the browser

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import { getProduct, type AdminProduct } from "@/lib/adminApi";
import ProductForm from "@/components/admin/ProductForm";
import PhotoManager from "@/components/admin/PhotoManager";
import StockManager from "@/components/admin/StockManager";

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formKey, setFormKey] = useState(0); // bump to reset the details form to the server's values

  const load = useCallback(async () => {
    try {
      setProduct(await getProduct(id));
      setError("");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 404 ? "This product does not exist." : e instanceof ApiError ? e.message : "Could not load the product.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // After a photo or stock change: refresh the data but leave the details form alone
  const refresh = useCallback(async () => {
    try {
      setProduct(await getProduct(id));
    } catch {
      setNotice("Saved, but the page could not refresh. Reload to see the latest.");
    }
  }, [id]);

  const back = (
    <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
      <ArrowLeft size={16} /> All products
    </Link>
  );

  if (error) {
    return (
      <div>
        {back}
        <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      </div>
    );
  }
  if (!product) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      {back}
      <h1 className="mt-3 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {product.isPublished ? "Live in the shop" : "Draft, hidden from the shop"} · /{product.slug}
      </p>
      <p role="status" className="mt-4 min-h-5 text-sm text-green-700">{notice}</p>

      <div className="max-w-3xl space-y-6">
        <ProductForm
          key={formKey}
          product={product}
          onSaved={(p) => { setProduct(p); setFormKey((k) => k + 1); setNotice("Changes saved."); }}
          onReload={async () => { await load(); setFormKey((k) => k + 1); setNotice("Loaded the latest version."); }}
        />

        <PhotoManager product={product} onChanged={refresh} />
        <StockManager key={product.colors.map((c) => c.name).join("|") + product.sizes.join("|")} product={product} onChanged={refresh} />
      </div>
    </div>
  );
}