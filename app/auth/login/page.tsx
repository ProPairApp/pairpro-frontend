"use client";

import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      const el = document.querySelector<HTMLInputElement>('input[name="email"]');
      el?.focus();
    } catch {}
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setMsg(null);
    setSubmitting(true);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);

    try {
      if (!email.trim() || !pw) throw new Error("Please enter email and password.");

      const form = new URLSearchParams();
      form.set("username", email.trim());
      form.set("password", pw);

      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("pairpro_token", data.access_token);

      window.location.href = "/dashboard";
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
      setSubmitting(false);
      btnRef.current?.focus();
    } finally {
      clearTimeout(t);
    }
  }

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Log in</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 380 }}>
        <label style={{ display: "grid", gap: 4 }}>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Password
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-pressed={showPw}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          ref={btnRef}
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            background: submitting ? "#888" : "black",
            color: "white",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: 600,
            transition: "transform 80ms ease",
            touchAction: "manipulation",
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10, color: "crimson" }}>{msg}</p>}

      <p style={{ marginTop: 12 }}>
        <a href="/auth/forgot">Forgot password?</a>
      </p>

      <p style={{ marginTop: 12 }}>
        No account? <a href="/auth/signup">Sign up</a>
      </p>
    </main>
  );
}
