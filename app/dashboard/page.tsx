"use client";

import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

type User = { id: number; email: string; role: "client" | "provider" };
type Provider = {
  id: number;
  name: string;
  service_type?: string | null;
  city?: string | null;
  rating?: number | null;
};

export default function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [user, setUser] = useState<User | null>(null);
  const [mine, setMine] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ useEffect is INSIDE the component
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
    if (!token) {
      alert("Please log in to view your dashboard.");
      window.location.href = "/auth/login";
      return;
    }

    (async () => {
      try {
        // who am I?
        const meRes = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!meRes.ok) throw new Error(await meRes.text());
        const me: User = await meRes.json();
        setUser(me);

        if (me.role === "provider") {
          const mineRes = await fetch(`${base}/me/providers`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          const rows: Provider[] = mineRes.ok ? await mineRes.json() : [];
          setMine(rows);
        }
      } catch (e: any) {
        setMsg(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [base]);

  if (loading) return <main><p>Loading dashboard…</p></main>;
  if (!user) return <main><p>Not logged in.</p></main>;

  return (
    <main>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>
        Logged in as <strong>{user.email}</strong> ({user.role})
      </p>

      <p><LogoutButton redirect="/" /></p>

      {user.role === "provider" ? (
        <>
          <h2 style={{ marginTop: 24 }}>My Providers</h2>
          <p><a href="/providers/new">+ Add Provider</a></p>
          {mine.length === 0 ? (
            <p>No provider profiles yet.</p>
          ) : (
            <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Service</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>City</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((p) => (
                  <tr key={p.id}>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      <a href={`/providers/${p.id}`} style={{ textDecoration: "underline" }}>{p.name}</a>
                    </td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{p.service_type ?? ""}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{p.city ?? ""}</td>
                    <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                      {typeof p.rating === "number" ? `⭐ ${p.rating.toFixed(1)}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <>
          <h2 style={{ marginTop: 24 }}>Welcome, Client!</h2>
          <p>Browse providers on <a href="/providers">the directory</a> and leave reviews.</p>
        </>
      )}

      {msg && <p style={{ color: "crimson", marginTop: 16 }}>Error: {msg}</p>}
    </main>
  );
}
