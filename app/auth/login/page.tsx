"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const baseRaw = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || "";
  const base = useMemo(() => baseRaw.replace(/\/+$/, ""), [baseRaw]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setMsg(null);
    setSubmitting(true);

    try {
      if (!base) throw new Error("API base URL is not set.");

      // OAuth2PasswordRequestForm expects x-www-form-urlencoded with username/password
      const body = new URLSearchParams();
      body.set("username", email.trim());
      body.set("password", password);

      // Login: set HttpOnly cookie via Set-Cookie (needs credentials: 'include')
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        credentials: "include", // <-- critical: accept cookie from backend
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed (${res.status})`);
      }

      // Optional sanity check using the cookie (no Authorization header needed)
      const me = await fetch(`${base}/auth/me`, {
        credentials: "include", // send cookie back
        cache: "no-store",
      });
      if (!me.ok) {
        const mt = await me.text();
        throw new Error(`/auth/me failed: ${mt || me.status}`);
      }

      // All good — go to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const msg =
        err?.name === "AbortError"
          ? "Network timeout. Try again."
          : String(err?.message || "Something went wrong.");
      setMsg(msg);
      btnRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Log in</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 4 }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <button
          ref={btnRef}
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: submitting ? "#777" : "black",
            color: "white",
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Signing in…" : "Log in"}
        </button>

        {msg && <p style={{ color: "crimson", marginTop: 4 }}>{msg}</p>}
      </form>

      <div style={{ marginTop: 16, opacity: 0.7, fontSize: 12, lineHeight: 1.5 }}>
        <div><strong>API base:</strong> {base || "(not set)"}</div>
        <div>
          Health:{" "}
          <a href={`${base}/health`} target="_blank" rel="noreferrer">
            {base}/health
          </a>
        </div>
        <div>
          Tip: set <code>NEXT_PUBLIC_API_BASE</code> or <code>NEXT_PUBLIC_API_URL</code> to{" "}
          <code>https://pairpro-backend-vyh1.onrender.com</code> (no trailing slash).
        </div>
      </div>
    </main>
  );
}
