"use client"; // uses state and browser storage, so it runs in the browser

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  type AuthResult,
  type User,
} from "@/lib/authApi";

// Everything other components can read or call
type AuthContextValue = {
  user: User | null;  // null = signed out
  ready: boolean;     // true once we've checked for a saved login (avoids a "signed out" flash)
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "be-tender-token"; // where the login token is kept in the browser

// Small helpers: storage can be blocked, so every access is wrapped
const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const writeToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: the login just won't survive a refresh */
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // On first load: if a token was saved, ask the API who it belongs to
  useEffect(() => {
    const token = readToken();
    if (!token) {
      setReady(true);
      return;
    }
    meRequest(token)
      .then((r) => setUser(r.user))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) writeToken(null); // token expired or revoked: forget it
      })
      .finally(() => setReady(true));
  }, []);

  // Save the token and remember the user
  const startSession = useCallback((r: AuthResult) => {
    writeToken(r.token);
    setUser(r.user);
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone?: string; password: string }) => {
      startSession(await registerRequest(input));
    },
    [startSession]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      startSession(await loginRequest({ email, password }));
    },
    [startSession]
  );

  const logout = useCallback(async () => {
    const token = readToken();
    try {
      if (token) await logoutRequest(token); // revoke it on the server
    } catch {
      /* already invalid or offline: we still sign out here */
    }
    writeToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, register, login, logout }),
    [user, ready, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The one-line way for any component to use it: const { user } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}