// Talks to the Laravel auth endpoints. Every page and component goes through this file.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

// A customer, exactly as UserResource sends it
export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin" | "super_admin"; // decides storefront vs admin
  createdAt: string;
};

// What register and login return
export type AuthResult = { user: User; token: string };

// A failed request. "fields" holds Laravel's per-field messages, e.g. { email: ["The email has already been taken."] }
export class ApiError extends Error {
  status: number; // HTTP status (0 = the server could not be reached)
  fields: Record<string, string[]>;

  constructor(message: string, status: number, fields: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// One helper for every call: adds the JSON headers and the token, and turns failures into ApiError
  export async function call<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  token: string | null = null,
  body?: unknown,
  extraHeaders: Record<string, string> = {} // e.g. the Idempotency-Key
    ): Promise<T> {  
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Accept: "application/json", // ask Laravel for JSON, even for errors
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // proves who we are
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store", // never reuse an old answer for account data
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return undefined as T; // logout answers with no body

  const data = await res.json().catch(() => ({})); // an HTML error page is not JSON
  if (!res.ok) {
    throw new ApiError(data.message ?? "Something went wrong. Please try again.", res.status, data.errors ?? {});
  }
  return data as T;
}

export const registerRequest = (input: { name: string; email: string; phone?: string; password: string }) =>
  call<AuthResult>("/register", "POST", null, input);

export const loginRequest = (input: { email: string; password: string }) =>
  call<AuthResult>("/login", "POST", null, input);

export const meRequest = (token: string) => call<{ user: User }>("/me", "GET", token);

export const logoutRequest = (token: string) => call<void>("/logout", "POST", token);