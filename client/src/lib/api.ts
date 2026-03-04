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
