import { apiProxy } from "./proxy.functions";

export type ApiResult<T> = { ok: boolean; status: number; data: T | null; error?: string };

function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("rental_jwt") ?? undefined;
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown; token?: string } = {},
): Promise<ApiResult<T>> {
  const token = opts.token ?? getToken();
  const res = await apiProxy({
    data: {
      path,
      method: opts.method ?? "GET",
      token,
      body: opts.body,
    },
  });
  let parsed: unknown = null;
  try {
    parsed = res.body ? JSON.parse(res.body) : null;
  } catch {
    parsed = res.body;
  }
  if (!res.ok) {
    const err =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as Record<string, unknown>).message)
        : typeof parsed === "string"
          ? parsed
          : `Request failed (${res.status})`) || `Request failed (${res.status})`;
    return { ok: false, status: res.status, data: null, error: err };
  }
  return { ok: true, status: res.status, data: parsed as T };
}