"use client";

import { useState } from "react";

export default function SignupPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState<"client" | "provider">("client");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw, role }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Account created! You can log in now.");
    } catch (err: any) {
      setMsg(err.message || "Failed");
    }
  }

  return (
    <main>
      <h1 style={{ marginBottom: 12 }}>Sign up</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
               style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
        <input placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)}
               style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
        <select value={role} onChange={(e) => setRole(e.target.value as any)}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}>
          <option value="client">Client (free)</option>
          <option value="provider">Provider</option>
        </select>
        <button type="submit" style={{ padding: "10px 14px", border: "none", borderRadius: 8, background: "black", color: "white" }}>
          Create account
        </button>
      </form>
      {msg && <p style={{ marginTop: 10, color: msg.includes("created") ? "green" : "crimson" }}>{msg}</p>}
      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/auth/login">Log in</a>
      </p>
    </main>
  );
}
