"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "mangoz-user";
const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;

interface AuthContextValue {
  username: string | null;
  ready: boolean;
  login: (username: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  username: null,
  ready: false,
  login: () => ({ ok: false, error: "Not ready" }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && USERNAME_RE.test(raw)) setUsername(raw);
    } catch {
      // storage unavailable — stay logged out
    }
    setReady(true);
  }, []);

  const login = useCallback((name: string) => {
    const clean = name.trim();
    if (!USERNAME_RE.test(clean)) {
      return {
        ok: false,
        error: "Username must be 3–16 characters: letters, numbers, underscore.",
      };
    }
    setUsername(clean);
    try {
      window.localStorage.setItem(STORAGE_KEY, clean);
    } catch {
      // ignore
    }
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUsername(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ username, ready, login, logout }),
    [username, ready, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
