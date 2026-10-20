"use client"; // forms, state and API calls

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { addStaff, listStaff, updateStaff, type StaffMember } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/format";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

// An action waiting for the admin to confirm it
type Pending = {
  title: string;
  message: string;
  confirmLabel: string;
  done: string;                  // success note
  run: () => Promise<unknown>;
};

const roleName = (r: string) => (r === "super_admin" ? "a super admin" : "an admin");

// First useful message from an API error
const errorText = (e: unknown) =>
  e instanceof ApiError ? (Object.values(e.fields)[0]?.[0] ?? e.message) : "Something went wrong. Please try again.";

export default function StaffManager() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [working, setWorking] = useState(false);

  // Add-staff form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    try {
      setStaff(await listStaff());
      setLoadError("");
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Could not load the team.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setFormError("");
    setFields({});
    setNotice("");
    try {
      await addStaff({
        email: email.trim(),
        role,
        ...(name.trim() ? { name: name.trim() } : {}),   // only for a brand-new account
        ...(password ? { password } : {}),               // same
      });
      setNotice(`${email.trim()} is now ${roleName(role)}.`);
      setEmail(""); setName(""); setPassword(""); setRole("admin");
      await load();
    } catch (err) {
      if (err instanceof ApiError) { setFields(err.fields); setFormError(err.message); }
      else setFormError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  // Run the confirmed action, then reload the team
  const runPending = async () => {
    if (!pending) return;
    setWorking(true);
    setActionError("");
    setNotice("");
    try {
      await pending.run();
      setNotice(pending.done);
    } catch (e) {
      setActionError(errorText(e)); // e.g. "keep at least one active super admin"
    } finally {
      setWorking(false);
      setPending(null);
      await load();
    }
  };

  const changeRole = (s: StaffMember, next: "admin" | "super_admin") => {
    if (next === s.role) return;
    setPending({
      title: `Make ${s.name} ${roleName(next)}?`,
      message: next === "super_admin"
        ? "Super admins can manage the team and see the audit log."
        : "They will lose access to team management and the audit log.",
      confirmLabel: "Yes, change role",
      done: `${s.name} is now ${roleName(next)}.`,
      run: () => updateStaff(s.id, { role: next }),
    });
  };

  const removeFromStaff = (s: StaffMember) =>
    setPending({
      title: `Remove ${s.name} from staff?`,
      message: "They become an ordinary customer and lose all admin access.",
      confirmLabel: "Yes, remove",
      done: `${s.name} was removed from staff.`,
      run: () => updateStaff(s.id, { role: "customer" }),
    });

  const deactivate = (s: StaffMember) =>
    setPending({
      title: `Deactivate ${s.name}?`,
      message: "Their active sessions are revoked straight away. You can reactivate them later.",
      confirmLabel: "Yes, deactivate",
      done: `${s.name} was deactivated.`,
      run: () => updateStaff(s.id, { is_active: false }),
    });

  const reactivate = (s: StaffMember) =>
    setPending({
      title: `Reactivate ${s.name}?`,
      message: "They will be able to use their account again.",
      confirmLabel: "Yes, reactivate",
      done: `${s.name} was reactivated.`,
      run: () => updateStaff(s.id, { is_active: true }),
    });

  const input = "w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10";
  const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase";
  const fe = (k: string) => fields[k]?.[0] && <p className="mt-1 text-xs text-red-600">{fields[k][0]}</p>;
  const rowButton = "rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold transition hover:border-ink disabled:opacity-50";

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-muted">People who can sign in to this admin area.</p>

      {/* Add staff */}
      <form onSubmit={submitAdd} className="mt-6 space-y-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-semibold">Add staff</h2>
          <p className="mt-1 text-xs text-muted">
            Already a customer? Just enter their email and a role. A brand-new person also needs a name and a password (at least 8 characters).
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="s-email" className={label}>Email</label>
            <input id="s-email" type="email" required className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
            {fe("email")}
          </div>
          <div>
            <label htmlFor="s-role" className={label}>Role</label>
            <select id="s-role" className={input} value={role} onChange={(e) => setRole(e.target.value as "admin" | "super_admin")}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
            {fe("role")}
          </div>
          <div>
            <label htmlFor="s-name" className={label}>Name (new people only)</label>
            <input id="s-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
            {fe("name")}
          </div>
          <div>
            <label htmlFor="s-pass" className={label}>Password (new people only)</label>
            <input id="s-pass" type="password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            {fe("password")}
          </div>
        </div>
        {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
        <button type="submit" disabled={adding} className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60">
          {adding ? "Adding..." : "Add to team"}
        </button>
      </form>

      <p role="status" className="mt-5 min-h-5 text-sm text-green-700">{notice}</p>
      {actionError && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
          <button onClick={load} className="rounded-full border border-red-300 px-4 py-1.5 font-semibold">Try again</button>
        </div>
      )}
      {!staff && !loadError && <p className="text-muted">Loading...</p>}

      {staff && (
        <ul className="divide-y divide-black/5 rounded-2xl border border-black/5 bg-white shadow-sm">
          {staff.map((s) => {
            const mine = s.id === user?.id; // the API refuses edits to your own account
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="font-semibold">
                    {s.name}
                    {mine && <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 align-middle text-[10px] font-semibold text-zinc-700 uppercase">You</span>}
                  </p>
                  <p className="text-xs break-all text-muted">{s.email} · Joined {formatDateTime(s.createdAt)}</p>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.isActive ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-700"}`}>
                  {s.isActive ? "Active" : "Deactivated"}
                </span>

                <select
                  aria-label={`Role for ${s.name}`} value={s.role} disabled={mine || working}
                  onChange={(e) => changeRole(s, e.target.value as "admin" | "super_admin")}
                  className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>

                <div className="flex gap-2">
                  {s.isActive
                    ? <button disabled={mine || working} onClick={() => deactivate(s)} className={rowButton}>Deactivate</button>
                    : <button disabled={mine || working} onClick={() => reactivate(s)} className={rowButton}>Reactivate</button>}
                  <button disabled={mine || working} onClick={() => removeFromStaff(s)} className={`${rowButton} text-red-600`}>Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pending !== null}
        danger={pending?.confirmLabel !== "Yes, reactivate"}
        busy={working}
        title={pending?.title ?? ""}
        message={pending?.message ?? ""}
        confirmLabel={pending?.confirmLabel ?? "Confirm"}
        cancelLabel="Cancel"
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}