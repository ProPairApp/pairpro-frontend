"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);
  const roleRef  = useRef<HTMLSelectElement>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setMsg(null);
    setLoading(true);
    try {
      const email = emailRef.current?.value.trim() || "";
      const pw    = passRef.current?.value || "";
      const role  = roleRef.current?.value || "client";

      if (!email || !pw) throw new Error("Please enter email and password");
      if (pw.length < 6) throw new Error("Password must be at least 6 characters");

      const r = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw, role }),
      });

      if (!r.ok) {
        const txt = await r.text();
        // backend returns “Email already registered” on 400
        throw new Error(txt || "Signup failed");
      }

      // success — go to login so they can sign in
      setMsg("Account created! Redirecting to login…");
      setTimeout(() => router.push("/auth/login"), 900);
    } catch (err: any) {
      setMsg(err?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Create your account</h1>

      <form onSubmit={handleSubmit} style={{ display:"grid", gap:10, maxWidth:380 }}>
        <label style={{ display:"grid", gap:6 }}>
          Email
          <input
            ref={emailRef}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            style={{ padding:10, border:"1px solid #ccc", borderRadius:8 }}
          />
        </label>

        <label style={{ display:"grid", gap:6 }}>
          Password (min 6)
          <input
            ref={passRef}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            style={{ padding:10, border:"1px solid #ccc", borderRadius:8 }}
          />
        </label>

        <label style={{ display:"grid", gap:6 }}>
          I am a…
          <select
            ref={roleRef}
            defaultValue="client"
            style={{ padding:10, border:"1px solid #ccc", borderRadius:8 }}
          >
            <option value="client">Client (free)</option>
            <option value="provider">Provider</option>
          </select>
        </label>

        <button
          disabled={loading}
          style={{ padding:"10px 14px", border:"none", borderRadius:8, background:"black", color:"white" }}
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      {msg && (
        <p style={{ marginTop:10, color: msg.startsWith("Account created") ? "green" : "crimson" }}>
          {msg}
        </p>
      )}

      <p style={{ marginTop:8 }}>
        Already have an account? <a href="/auth/login">Log in</a>
      </p>
    </main>
  );
}
