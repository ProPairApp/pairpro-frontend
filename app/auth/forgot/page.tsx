"use client";

import { useEffect, useRef, useState } from "react";

export default function ForgotPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try { document.querySelector<HTMLInputElement>('input[name="email"]')?.focus(); } catch {}
  }, []);

  function isValidEmail(x: string) { return /\S+@\S+\.\S+/.test(x); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setMsg(null); setResetLink(null);

    if (!isValidEmail(email.trim())) { setMsg("Please enter a valid email."); return; }

    setSubmitting(true);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(`${base}/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      setMsg("If that email exists, we sent a reset link.");
      if (data?.reset_url) setResetLink(data.reset_url); // dev helper
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
      btnRef.current?.focus();
    } finally {
      setSubmitting(false);
      clearTimeout(t);
    }
  }

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Forgot password</h1>
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
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      {resetLink && <p style={{ marginTop: 8 }}>Dev shortcut: <a href={resetLink}>Reset now</a></p>}
    </main>
  );
}
