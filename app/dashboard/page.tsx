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

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
    if (!token) {
      alert("Please log in to view your dashboard.");
      window.location.href = "/auth/login";
      return;
    }

    (async () => {
      try {
        const meRes = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!meRes.ok) throw new Error("Not authenticated");
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [base]);

  if (loading) return <main><p>Loading…</p></main>;
  if (!user) return <main><p>Not logged in.</p></main>;

  return (
    <main>
      <h1>Dashboard</h1>
      <p>
        Logged in as <strong>{user.email}</strong> ({user.role})
      </p>

      <LogoutButton redirect="/" />

      {user.role === "provider" ? (
        <>
          <h2>My Providers</h2>
          {mine.length === 0 ? (
            <p>No providers yet. <a href="/providers/new">Add one</a></p>
          ) : (
            <ul>
              {mine.map((p) => (
                <li key={p.id}>
                  <a href={`/providers/${p.id}`}>{p.name}</a> — {p.service_type} in {p.city}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Welcome, client! Browse <a href="/providers">providers</a> and leave reviews.</p>
      )}
    </main>
  );
}
