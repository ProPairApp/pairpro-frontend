"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
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
      const name = nameRef.current?.value.trim() || "";
      const last_name = lastNameRef.current?.value.trim() || "";
      const username = usernameRef.current?.value.trim() || "";
      const email = emailRef.current?.value.trim() || "";
      const password = passRef.current?.value || "";
      const role  = roleRef.current?.value || "client";

      if (!email || !password) throw new Error("Please enter email and password");
      if (password.length < 6) throw new Error("Password must be at least 6 characters");

      // Optional light validation
      if (username && !/^[a-zA-Z0-9._-]{3,20}$/.test(username)) {
        throw new Error("Username must be 3–20 chars (letters, numbers, ., _, -)");
      }

      const r = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          name: name || undefined,
          last_name: last_name || undefined,
          username: username || undefined,
        }),
      });

      if (!r.ok) {
        const txt = await r.text();
        // server may return “Email already registered” or “Username already taken”
        throw new Error(txt || "Signup failed");
      }

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

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <label>
            First Name
            <input
              ref={nameRef}
              placeholder="Francia"
              autoComplete="given-name"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            Last Name
            <input
              ref={lastNameRef}
              placeholder="Minier"
              autoComplete="family-name"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            Username <span style={{ opacity: 0.7 }}>(optional, public)</span>
            <input
              ref={usernameRef}
              placeholder="franciam"
              autoComplete="nickname"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            Email
            <input
              ref={emailRef}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            Password (min 6)
            <input
              ref={passRef}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gap: 6 }}>
          <label>
            I am a…
            <select
              ref={roleRef}
              defaultValue="client"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
            >
              <option value="client">Client (free)</option>
              <option value="provider">Provider</option>
            </select>
          </label>
        </div>

        <button
          disabled={loading}
          style={{ padding: "10px 14px", border: "none", borderRadius: 8, background: "black", color: "white" }}
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      {msg && (
        <p style={{ marginTop: 10, color: msg.startsWith("Account created") ? "green" : "crimson" }}>
          {msg}
        </p>
      )}

      <p style={{ marginTop: 8 }}>
        Already have an account? <a href="/auth/login">Log in</a>
      </p>
    </main>
  );
}
