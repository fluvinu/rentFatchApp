import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API_BASE = process.env.API_BASE || "http://localhost:8080";

export const apiProxy = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      path: z.string().min(1),
      method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
      token: z.string().optional(),
      body: z.unknown().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (data.token) headers.Authorization = `Bearer ${data.token}`;

    const init: RequestInit = { method: data.method, headers };
    if (data.body !== undefined && data.method !== "GET") {
      init.body = JSON.stringify(data.body);
    }

    const res = await fetch(`${API_BASE}${data.path}`, init);
    const text = await res.text();
    return { ok: res.ok, status: res.status, body: text };
  });