/**
 * Shared `fetch` wrapper for authenticated API calls.
 *
 * Uses **relative** `/api` paths so the Vite dev-server proxy (configured in
 * `vite.config.ts`) forwards requests to the Express backend, keeping cookies
 * and CORS simple. Define `VITE_Backend_Base_url` in the client env to hit a
 * different origin (e.g. a deployed backend) — same pattern as AuthContext.
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
