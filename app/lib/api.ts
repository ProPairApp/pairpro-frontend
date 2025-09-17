// app/lib/api.ts
// Single place to call your backend from the Next.js app router.

// REQUIRED in Vercel env:
// NEXT_PUBLIC_API_BASE = https://pairpro-backend-vyh1.onrender.com

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
if (!API_BASE) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE env var");
}

// Small helper to read response or throw a nice Error
async function readJson(res: Response) {
  const text = await res.text();
  if (!res.ok) {
    // keep some body text to help debugging
    throw new Error(`${res.status} ${res.statusText} — ${text || "No response body"}`);
  }
  try { return JSON.parse(text); } catch { return text as any; }
}

// Default options used by all requests
const defaults: RequestInit = {
  // So your UI always sees fresh data (no stale cache surprises)
  cache: "no-store",
  // Include cookies for auth (your backend sets session cookie)
  credentials: "include",
};

export const api = {
  // GET JSON
  async get<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { ...defaults, ...init, method: "GET" });
    return readJson(res);
  },

  // POST JSON
  async post<T = any>(path: string, body: any, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...defaults,
      ...init,
      method: "POST",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      body: JSON.stringify(body),
    });
    return readJson(res);
  },

  // PUT JSON
  async put<T = any>(path: string, body: any, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...defaults,
      ...init,
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      body: JSON.stringify(body),
    });
    return readJson(res);
  },

  // DELETE
  async del<T = any>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { ...defaults, ...init, method: "DELETE" });
    return readJson(res);
  },
};

// Optional: export base for building absolute URLs elsewhere
export { API_BASE };
