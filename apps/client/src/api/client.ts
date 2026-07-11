/**
 * Shared `fetch` wrapper for authenticated API calls.
 *
 * Uses **relative** `/api` paths so requests stay same-origin:
 * - Dev: the Vite dev-server proxy (vite.config.ts) forwards to Express.
 * - Prod: Vercel's external rewrite (vercel.json) proxies to the Render API,
 *   so cookies are first-party and Chrome's third-party cookie blocking
 *   doesn't apply.
 *
 * Define `VITE_Backend_Base_url` only for local dev when you want to hit a
 * backend that isn't behind the Vite proxy.
 */
const API_BASE = import.meta.env.VITE_Backend_Base_url ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = (await res.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!res.ok) {
    throw new ApiError(data?.message ?? "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

export const api = { get: apiFetch, post: apiFetch, put: apiFetch, patch: apiFetch, delete: apiFetch };
