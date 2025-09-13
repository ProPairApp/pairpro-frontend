"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setMsg(null);
    setLoading(true);
    try {
      const email = emailRef.current?.value.trim() || "";
      const pw    = passRef.current?.value || "";
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

      // ✅ IMPORTANT: store the token so the dashboard can read it
      localStorage.setItem("pairpro_token", data.access_token);

      router.push("/dashboard");
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
        <input ref={emailRef} type="email" placeholder="email@example.com" autoComplete="email" />
        <input ref={passRef} type="password" placeholder="password" autoComplete="current-password" />
        <button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
      </form>
      {msg && <p style={{ color: "crimson", marginTop: 10 }}>Error: {msg}</p>}
      <p style={{ marginTop: 8 }}>
        New here? <a href="/auth/signup">Create an account</a>
      </p>
    </main>
  );
}
