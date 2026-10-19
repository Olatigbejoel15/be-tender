"use client"; // reads the URL and loads data in the browser

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import { getProduct, type AdminProduct } from "@/lib/adminApi";
import ProductForm from "@/components/admin/ProductForm";

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

      {/* key = version: after a save or reload the form remounts with the fresh values */}
      <ProductForm
        key={product.version}
        product={product}
        onSaved={(p) => { setProduct(p); setNotice("Changes saved."); }}
        onReload={() => { setNotice("Loaded the latest version."); load(); }}
      />
    </div>
  );
}