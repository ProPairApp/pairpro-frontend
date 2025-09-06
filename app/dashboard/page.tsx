"use client";

import { useEffect, useState } from "react";

type User = { id: number; email: string; role: "client" | "provider" };
type Provider = { id: number; name: string; service_type?: string | null; city?: string | null; rating?: number | null; };

export default function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [user, setUser] = useState<User | null>(null);
  const [mine, setMine] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
    if (!token) { window.location.href = "/auth/login"; return; }
    (async () => {
      try {
        const meRes = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!meRes.ok) throw new Error(await meRes.text());
        const me: User = await meRes.json();
        setUser(me);
        if (me.role === "provider") {
          const mineRes = await fetch(`${base}/providers?owner=me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
          if (mineRes?.ok) setMine(await mineRes.json());
        }
      } catch (e: any) { setMsg(e.message || "Failed to load"); }
      finally { setLoading(false); }
    })();
  }, [base]);

  if (loading) return <main><p>Loading…</p></main>;
  if (!user) return <main><p>Not logged in.</p></main>;

  return (
    <main>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Logged in as <strong>{user.email}</strong> ({user.role})</p>

      {user.role === "provider" ? (
        <>
          <h2 style={{ marginTop: 24 }}>My Providers</h2>
          <p><a href="/providers/new">+ Add Provider</a></p>
          {mine.length === 0 ? (
            <p>No provider profiles yet.</p>
          ) : (
            <ul>
              {mine.map((p) => (
                <li key={p.id}><a href={`/providers/${p.id}`}>{p.name}</a> — {p.service_type} in {p.city}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <h2 style={{ marginTop: 24 }}>Welcome, Client!</h2>
          <p>Browse <a href="/providers">providers</a> and leave reviews.</p>
        </>
      )}

      {msg && <p style={{ color: "crimson", marginTop: 16 }}>Error: {msg}</p>}
    </main>
  );
}
