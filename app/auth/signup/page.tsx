"use client";

import { useEffect, useRef, useState } from "react";

type Role = "client" | "provider";

export default function SignupPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try { document.querySelector<HTMLInputElement>('input[name="email"]')?.focus(); } catch {}
  }, []);

  function isValidEmail(x: string) { return /\S+@\S+\.\S+/.test(x); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setMsg(null);
    if (!isValidEmail(email.trim())) { setMsg("Please enter a valid email."); return; }
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }

    setSubmitting(true);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pw, role }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Sign up failed");
      }

      const form = new URLSearchParams();
      form.set("username", email.trim());
      form.set("password", pw);

      const loginRes = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        signal: controller.signal,
      });
      if (!loginRes.ok) {
        const txt = await loginRes.text();
        throw new Error(txt || "Auto-login failed. Please log in manually.");
      }
      const data = await loginRes.json();
      localStorage.setItem("pairpro_token", data.access_token);

      if (role === "provider") window.location.href = "/providers/new";
      else window.location.href = "/dashboard";
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
      <h1 style={{ marginBottom: 12 }}>Create your account</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
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
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              minLength={6}
              required
            />
            <button type="button" onClick={() => setShowPw(s => !s)}
              aria-pressed={showPw}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <span style={{ fontSize: 12, opacity: 0.7 }}>At least 6 characters</span>
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Confirm Password
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPw2 ? "text" : "password"}
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              minLength={6}
              required
            />
            <button type="button" onClick={() => setShowPw2(s => !s)}
              aria-pressed={showPw2}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}>
              {showPw2 ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Account type
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          >
            <option value="client">Client (free)</option>
            <option value="provider">Provider</option>
          </select>
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10, color: "crimson" }}>{msg}</p>}

      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/auth/login">Log in</a>
      </p>
    </main>
  );
}
