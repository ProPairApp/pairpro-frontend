"use client";

import { useMemo, useRef, useState } from "react";

export default function ResetPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const search = typeof window !== "undefined" ? window.location.search : "";
  const token = useMemo(() => new URLSearchParams(search).get("t") || "", [search]);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setMsg(null);
    if (!token) { setMsg("Missing or invalid reset token."); return; }
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }

    setSubmitting(true);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(`${base}/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: pw }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Reset failed");
      }
      setDone(true);
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
      btnRef.current?.focus();
      setSubmitting(false);
    } finally {
      clearTimeout(t);
    }
  }

  if (done) {
    return (
      <main>
        <h1>Password reset</h1>
        <p>Your password was updated.</p>
        <p><a href="/auth/login">Log in</a></p>
      </main>
    );
  }

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Reset your password</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label style={{ display: "grid", gap: 4 }}>
          New password
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              minLength={6}
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

        <label style={{ display: "grid", gap: 4 }}>
          Confirm password
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPw2 ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw2((s) => !s)}
              aria-pressed={showPw2}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}
            >
              {showPw2 ? "Hide" : "Show"}
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
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10, color: "crimson" }}>{msg}</p>}
    </main>
  );
}
