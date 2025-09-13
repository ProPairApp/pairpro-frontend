"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const baseRaw = process.env.NEXT_PUBLIC_API_URL || "";
  // normalize: remove trailing slash just in case
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

    // Always clear old token before trying a new login
    localStorage.removeItem("pairpro_token");

    try {
      if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set.");

      // Build form body as application/x-www-form-urlencoded (FastAPI expects this)
      const body = new URLSearchParams();
      body.set("grant_type", "password");
      body.set("username", email.trim());
      body.set("password", password);
      body.set("scope", "");
      body.set("client_id", "");
      body.set("client_secret", "");

      // Add a timeout so “Failed to fetch” doesn’t hang forever
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);

      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: ctrl.signal,
      });

      clearTimeout(t);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Login failed with ${res.status}`);
      }

      const data = await res.json(); // { access_token, token_type }
      if (!data?.access_token) {
        throw new Error("No access_token in response.");
      }

      localStorage.setItem("pairpro_token", data.access_token);
      // quick sanity ping to /auth/me (optional but helpful)
      const me = await fetch(`${base}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (!me.ok) {
        const mt = await me.text();
        throw new Error(`/auth/me failed: ${mt || me.status}`);
      }

      // All good -> go to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      // Make network/CORS errors clearer
      if (err?.name === "AbortError") {
        setMsg("Network timeout. Check your internet and try again.");
      } else if (String(err?.message || "").includes("Failed to fetch")) {
        setMsg(
          "Failed to reach the API. Double-check the URL below is correct and HTTPS."
        );
      } else {
        setMsg(err?.message || "Something went wrong.");
      }
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

        {msg && (
          <p style={{ color: "crimson", marginTop: 4 }}>
            {msg}
          </p>
        )}
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
          Tip: Make sure{" "}
          <code>NEXT_PUBLIC_API_URL</code> is exactly{" "}
          <code>https://pairpro-backend-vyh1.onrender.com</code> (no trailing slash).
        </div>
      </div>
    </main>
  );
}
