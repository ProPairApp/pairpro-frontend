"use client";

import { useState } from "react";

export default function LoginPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const form = new URLSearchParams();
      form.set("username", email);
      form.set("password", pw);
      const res = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Error ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem("pairpro_token", data.access_token);
      alert("Logged in! You can now add your provider profile.");
      window.location.href = "/providers/new";
    } catch (err: any) {
      setMsg(err.message || "Failed");
    }
  }

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Log in</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          type="submit"
          style={{ padding: "10px 14px", border: "none", borderRadius: 8, background: "black", color: "white" }}
        >
          Log in
        </button>
      </form>
      {msg && <p style={{ marginTop: 10, color: "crimson" }}>{msg}</p>}
      <p style={{ marginTop: 12 }}>
        No account? <a href="/auth/signup">Sign up</a>
      </p>
    </main>
  );
}
