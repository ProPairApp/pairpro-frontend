"use client";

import { useState } from "react";

export default function DebugAuth() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [out, setOut] = useState<string>("");

  async function trySignup() {
    setOut("Signing up…");
    const email = `fran+${Math.floor(Math.random()*100000)}@example.com`;
    const body = { email, password: "secret123", role: "client" };
    try {
      const r = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const txt = await r.text();
      setOut(`SIGNUP → ${r.status}\n${txt}\n(email was ${email})`);
    } catch (e: any) {
      setOut(`SIGNUP network error: ${e?.message || e}`);
    }
  }

  async function tryLogin() {
    setOut("Logging in…");
    // use the last email if shown, otherwise change this to an existing email
    const emailMatch = out.match(/email was ([^\s)]+)/);
    const email = emailMatch ? emailMatch[1] : "fran+test1@example.com";
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", "secret123");
    try {
      const r = await fetch(`${base}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      const txt = await r.text();
      setOut(`LOGIN → ${r.status}\n${txt}`);
    } catch (e: any) {
      setOut(`LOGIN network error: ${e?.message || e}`);
    }
  }

  return (
    <main style={{display:"grid", gap:12}}>
      <h1>Debug Auth</h1>
      <p>API base: <code>{base}</code></p>
      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        <button onClick={trySignup} style={{padding:"8px 12px"}}>Test Signup</button>
        <button onClick={tryLogin}  style={{padding:"8px 12px"}}>Test Login</button>
      </div>
      <pre style={{whiteSpace:"pre-wrap", background:"#f6f6f6", padding:12, borderRadius:6}}>
        {out || "Output will appear here…"}
      </pre>
      <p style={{fontSize:12, opacity:0.7}}>
        Tip: If signup says “Email already registered”, click “Test Signup” again
        (it uses a random email each time).
      </p>
    </main>
  );
}
