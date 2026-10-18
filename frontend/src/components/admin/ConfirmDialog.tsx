"use client"; // uses a ref and effects

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;      // red confirm button for destructive actions
  busy?: boolean;        // locks the dialog while saving
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, message, confirmLabel, danger, busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  // Keep the native dialog in sync with the `open` prop
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }} // Esc key
      onClick={(e) => { if (e.target === ref.current && !busy) onCancel(); }} // click on the dark backdrop
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-ink shadow-xl backdrop:bg-black/50"
    >
      {/* Inner div holds the padding so only the backdrop counts as "outside" */}
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} disabled={busy}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold transition hover:border-ink disabled:opacity-50">
            Keep order
          </button>
          <button onClick={onConfirm} disabled={busy}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-accent"
            }`}>
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}