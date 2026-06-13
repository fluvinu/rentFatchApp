import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api/client";

type User = { username: string };

type AuthCtx = {
  token: string | null;
  user: User | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, tenantName?: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "rental_jwt";
const USER_KEY = "rental_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t) setToken(t);
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api<{ token?: string; access_token?: string; jwt?: string }>("/auth/login", {
      method: "POST",
      body: { username, password },
      token: "",
    });
    if (!res.ok || !res.data) throw new Error(res.error ?? "Login failed");
    const tok = res.data.token ?? res.data.access_token ?? res.data.jwt;
    if (!tok) throw new Error("No token in response");
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(USER_KEY, JSON.stringify({ username }));
    setToken(tok);
    setUser({ username });
  }, []);

  const register = useCallback(async (username: string, password: string, tenantName?: string) => {
    const body: Record<string, string> = { username, password };
    if (tenantName) body.tenantName = tenantName;
    const res = await api("/auth/register", { method: "POST", body, token: "" });
    if (!res.ok) throw new Error(res.error ?? "Registration failed");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ token, user, ready, login, register, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}