import { getAccessToken } from "./supabase";

/**
 * API base URL for backend requests.
 * When empty (local dev, same origin), uses relative paths.
 * When set (Vercel + Railway split), points to Railway backend URL.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

/**
 * Fetch with Supabase auth token in Authorization header.
 */
export async function authFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(apiUrl(url), {
    ...options,
    headers,
    credentials: "include",
  });
}
