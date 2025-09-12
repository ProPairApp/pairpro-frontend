"use client";

import { useEffect, useState } from "react";

type User = { id: number; email: string; role: "client" | "provider" };

export default function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("pairpro_token")
            : null;

        if (!token) {
          setChecking(false);
          return; // not logged in
        }

        const r = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!r.ok) {
          // token invalid/expired/typo → treat as logged out
          setChecking(false);
          return;
        }

        const u = (await r.json()) as User;
        setUser(u);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch profile");
      } finally {
        setChecking(false);
      }
    }
    run();
  }, [base]);

  if (checking) {
    return <main>Checking your session…</main>;
  }

  if (!user) {
    return (
      <main>
        <h1>Not logged in</h1>
        <p>
          Please <a href="/auth/login">log in</a> or{" "}
          <a href="/auth/signup">create an account</a>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ display: "grid", gap: 12 }}>
      <h1>Welcome, {user.email}</h1>
      <p>
        Role: <strong>{user.role}</strong>
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/providers" style={{ textDecoration: "underline" }}>
          Browse Providers
        </a>
        <a href="/jobs/new" style={{ textDecoration: "underline" }}>
          Create Job
        </a>
        <a href="/jobs/mine" style={{ textDecoration: "underline" }}>
          My Hires
        </a>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("pairpro_token");
          window.location.href = "/auth/login";
        }}
        style={{
          marginTop: 8,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: "#fafafa",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
    </main>
  );
}
