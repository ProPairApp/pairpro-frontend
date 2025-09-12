"use client";

import { useRef, useState } from "react";

export default function LoginPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setMsg(null);
    setLoading(true);
    try {
      const email = emailRef.current?.value?.trim() || "";
      const pw = passRef.current?.value || "";
      if (!email || !pw) throw new Error("Enter email and password");

      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", pw);

      const r = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!r.ok) throw new Error(await r.text());

      const data = await r.json();
      // ✅ Save under the same key the dashboard expects
      localStorage.setItem("pairpro_token", data.access_token);
      window.location.href = "/dashboard";
    } catch (e: any) {
      setMsg(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={handleLogin} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <input
          ref={emailRef}
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <input
          ref={passRef}
          type="password"
          placeholder="password"
          autoComplete="current-password"
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <button
          disabled={loading}
          style={{
            padding: "10px 14px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {msg && <p style={{ color: "crimson", marginTop: 10 }}>Error: {msg}</p>}
      <p style={{ marginTop: 8 }}>
        <a href="/auth/forgot">Forgot password?</a>
      </p>
      <p style={{ marginTop: 8 }}>
        New here? <a href="/auth/signup">Create an account</a>
      </p>
    </main>
  );
}
