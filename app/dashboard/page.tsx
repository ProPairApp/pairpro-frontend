"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: number; email: string; role: "client" | "provider" };

export default function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    async function run() {
      const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
      if (!token) {
        setDebug("No token in localStorage.");
        setChecking(false);
        return;
      }
      try {
        const r = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) {
          const txt = await r.text();
          setDebug(`auth/me → ${r.status} ${txt}`);
          setChecking(false);
          return;
        }
        const u = (await r.json()) as User;
        setUser(u);
      } catch (e: any) {
        setDebug(`network error: ${e?.message || e}`);
      } finally {
        setChecking(false);
      }
    }
    run();
  }, [base]);

  if (checking) return <main>Checking your session…</main>;
  if (!user) {
    return (
      <main>
        <h1>Not logged in</h1>
        <p>Please <a href="/auth/login">log in</a> or <a href="/auth/signup">create an account</a>.</p>
        {debug && <pre style={{background:"#f6f6f6", padding:8, borderRadius:6, marginTop:12}}>{debug}</pre>}
      </main>
    );
  }

  return (
    <main style={{ display: "grid", gap: 12 }}>
      <h1>Welcome, {user.email}</h1>
      <p>Role: <strong>{user.role}</strong></p>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <a href="/providers">Browse Providers</a>
        <a href="/jobs/new">Create Job</a>
        <a href="/jobs/mine">My Hires</a>
      </div>
      <button onClick={() => { localStorage.removeItem("pairpro_token"); window.location.href = "/auth/login"; }}>
        Sign out
      </button>
    </main>
  );
}
