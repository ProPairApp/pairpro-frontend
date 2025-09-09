"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || "(unset)";
  const [health, setHealth] = useState<string>("(pending)");
  const [prov, setProv] = useState<string>("(pending)");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: "no-store" });
        setHealth(`${r.status} ${await r.text()}`);
      } catch (e: any) {
        setHealth(`ERR ${e?.message}`);
      }
      try {
        const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/providers`, { cache: "no-store" });
        setProv(`${r.status} ${await r.text()}`);
      } catch (e: any) {
        setProv(`ERR ${e?.message}`);
      }
    })().catch((e: any) => setErr(String(e?.message || e)));
  }, []);

  return (
    <main style={{fontFamily:"system-ui", lineHeight:1.5}}>
      <h1>Frontend → Backend Debug</h1>
      <p><strong>NEXT_PUBLIC_API_URL</strong>: <code>{base}</code></p>
      <p><strong>Fetch /health</strong>: <code>{health}</code></p>
      <p><strong>Fetch /providers</strong>: <code style={{wordBreak:"break-all"}}>{prov}</code></p>
      {err && <p style={{color:"crimson"}}>Page error: {err}</p>}
      <p style={{opacity:.7, marginTop:12}}>
        If base shows “(unset)”, set it in Vercel → Project → Settings → Environment Variables:
        <code> NEXT_PUBLIC_API_URL = https://pairpro-backend-vyh1.onrender.com</code> and redeploy.
      </p>
    </main>
  );
}
