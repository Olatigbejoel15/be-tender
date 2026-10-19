"use client"; // file inputs, state and API calls

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/authApi";
import { colorSlug, deleteProductPhoto, uploadProductPhoto, type AdminProduct, type ProductPhoto } from "@/lib/adminApi";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // the same 5 MB limit the server enforces

type Props = { product: AdminProduct; onChanged: () => Promise<void> };

export default function PhotoManager({ product, onChanged }: Props) {
  const [busy, setBusy] = useState<string | null>(null); // slug of the colour being uploaded
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [toRemove, setToRemove] = useState<{ photo: ProductPhoto; label: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  const photos = product.photos ?? [];
  const slugs = product.colors.map((c) => colorSlug(c.name));
  const unmatched = photos.filter((p) => p.color !== null && !slugs.includes(p.color)); // photos whose colour no longer exists

  const upload = async (colour: string, file: File | undefined) => {
    if (!file) return;
    setError("");
    setNotice("");

    // Check here first so the admin gets an instant, friendly message
    if (!TYPES.includes(file.type)) { setError("Please choose a PNG, JPG or WebP image."); return; }
    if (file.size > MAX_BYTES) { setError("That image is over 5 MB. Please use a smaller one."); return; }

    const slug = colorSlug(colour);
    setBusy(slug);
    try {
      await uploadProductPhoto(product.id, file, slug);
      await onChanged();
      setNotice(`Photo added for ${colour}.`);
    } catch (e) {
      setError(e instanceof ApiError ? (e.fields.photo?.[0] ?? e.message) : "Upload failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const confirmRemove = async () => {
    if (!toRemove) return;
    setRemoving(true);
    setError("");
    setNotice("");
    try {
      await deleteProductPhoto(product.id, toRemove.photo.id);
      await onChanged();
      setNotice(`Photo removed (${toRemove.label}).`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not remove the photo.");
    } finally {
      setRemoving(false);
      setToRemove(null);
    }
  };

  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-semibold">Photos</h2>
      <p className="mt-1 text-xs text-muted">
        One photo per colour (PNG, JPG or WebP, up to 5 MB). To replace one, remove it and upload a new one.
        Save any colour changes above first, so the slots match.
      </p>

      <p role="status" className="mt-3 min-h-5 text-sm text-green-700">{notice}</p>
      {error && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {product.colors.map((c) => {
          const slug = colorSlug(c.name);
          const photo = photos.find((p) => p.color === slug);
          const uploading = busy === slug;

          return (
            <li key={slug}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="h-3 w-3 rounded-full border border-black/20" style={{ background: c.hex }} />
                {c.name}
              </div>

              {photo ? (
                <div className="relative mt-2 aspect-[4/5] overflow-hidden rounded-xl bg-sand">
                  <Image src={photo.url} alt={`${c.name} photo`} fill sizes="200px" className="object-cover" />
                  <button
                    type="button" aria-label={`Remove the ${c.name} photo`}
                    onClick={() => setToRemove({ photo, label: c.name })}
                    className="absolute top-2 right-2 rounded-full bg-white/90 p-2 text-red-600 shadow transition hover:bg-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor={`photo-${slug}`}
                  className={`mt-2 flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 text-sm text-muted transition hover:border-accent hover:text-accent focus-within:border-accent ${busy !== null ? "pointer-events-none opacity-60" : ""}`}
                >
                  <ImagePlus size={22} />
                  {uploading ? "Uploading..." : "Upload photo"}
                  <input
                    id={`photo-${slug}`} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
                    disabled={busy !== null}
                    onChange={(e) => { upload(c.name, e.target.files?.[0]); e.target.value = ""; }} // reset so the same file can be picked again
                  />
                </label>
              )}
            </li>
          );
        })}
      </ul>

      {/* Photos whose colour was renamed or removed: nothing shows them in the shop any more */}
      {unmatched.length > 0 && (
        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Unmatched photos</p>
          <p className="mt-1 text-xs">These belong to a colour that no longer exists on this product.</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {unmatched.map((p) => (
              <li key={p.id} className="relative h-20 w-16 overflow-hidden rounded-lg bg-sand">
                <Image src={p.url} alt={`Unmatched photo (${p.color})`} fill sizes="64px" className="object-cover" />
                <button type="button" aria-label="Remove unmatched photo" onClick={() => setToRemove({ photo: p, label: p.color ?? "unmatched" })}
                  className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-red-600"><Trash2 size={12} /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={toRemove !== null}
        danger
        busy={removing}
        title="Remove this photo?"
        message="It is removed from the shop and deleted from image storage."
        confirmLabel="Yes, remove"
        cancelLabel="Keep photo"
        onConfirm={confirmRemove}
        onCancel={() => setToRemove(null)}
      />
    </section>
  );
}