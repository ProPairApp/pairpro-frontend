// app/lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL || // <-- your current var
  "";

if (!API_BASE) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE or NEXT_PUBLIC_API_URL");
}

async function readJson(res: Response) {
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${text || "No body"}`);
  try { return JSON.parse(text); } catch { return text as any; }
}

const defaults: RequestInit = {
  cache: "no-store",
  credentials: "include", // cookies for auth if needed
};

export const api = {
  get<T = any>(path: string, init: RequestInit = {}) {
    return fetch(`${API_BASE}${path}`, { ...defaults, ...init, method: "GET" }).then(readJson) as Promise<T>;
  },
  post<T = any>(path: string, body: any, init: RequestInit = {}) {
    return fetch(`${API_BASE}${path}`, {
      ...defaults, ...init, method: "POST",
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      body: JSON.stringify(body),
    }).then(readJson) as Promise<T>;
  },
};

export { API_BASE };
