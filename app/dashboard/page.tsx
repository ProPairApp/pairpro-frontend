"use client";

import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

type Me = {
  id: number;
  email: string;
  role: "client" | "provider";
  name?: string | null;
  last_name?: string | null;
  username?: string | null;
};

const base = process.env.NEXT_PUBLIC_API_URL!;

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [checking, setChecking] = useState(true);
  const [debug, setDebug] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("pairpro_token")
            : null;
        if (!token) {
          setDebug("No token in localStorage.");
          return;
        }
        const r = await fetch(`${base}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!r.ok) {
          const txt = await r.text();
          setDebug(`auth/me → ${r.status} ${txt}`);
          return;
        }
        const j: Me = await r.json();
        setMe(j);
      } catch (e: any) {
        setDebug(`network error: ${e?.message || e}`);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) return <main>Checking your session…</main>;

  if (!me) {
    return (
      <main>
        <h1>Not logged in</h1>
        <p>
          Please <a href="/auth/login">log in</a> or{" "}
          <a href="/auth/signup">create an account</a>.
        </p>
        {debug && (
          <pre
            style={{
              background: "#f6f6f6",
              padding: 8,
              borderRadius: 6,
              marginTop: 12,
            }}
          >
            {debug}
          </pre>
        )}
      </main>
    );
  }

  const displayName =
    (me.name && me.last_name
      ? `${me.name} ${me.last_name}`
      : me.name || "") ||
    me.username ||
    me.email;

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <h1>Welcome, {displayName}</h1>
      <p style={{ opacity: 0.8 }}>Role: <strong>{me.role}</strong></p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/jobs/new" className="btn">Create Job</a>
        <a href="/providers" className="btn">Find Providers</a>
        <a href="/jobs/mine" className="btn">My Jobs</a>
      </div>

      <div>
        <LogoutButton redirect="/auth/login" />
      </div>

      {debug && (
        <details>
          <summary>Debug</summary>
          <pre
            style={{
              background: "#f6f6f6",
              padding: 8,
              borderRadius: 6,
              marginTop: 8,
            }}
          >
            {debug}
          </pre>
        </details>
      )}
    </main>
  );
}
