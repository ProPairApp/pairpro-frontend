"use client";

import { useEffect, useState } from "react";

type Provider = { id: number; name: string; rating?: number | null; service_type?: string | null; city?: string | null };

export default function TopPros() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [items, setItems] = useState<Provider[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      if (!city.trim()) { setMsg("Enter a city"); setLoading(false); return; }
      const url = new URL(`${base}/providers/recommendations`);
      url.searchParams.set("city", city.trim());
      if (service.trim()) url.searchParams.set("service", service.trim());
      const r = await fetch(url.toString(), { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text());
      setItems(await r.json());
    } catch (e: any) {
      setMsg(e?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Optional: prefill a demo search
    // setCity("Miami"); setService(""); search();
  }, []);

  return (
    <section style={{border:"1px solid #eee", padding:16, borderRadius:12, marginBottom:16}}>
      <form onSubmit={search} style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City (e.g., Miami)"
          style={{ flex: "1 1 160px", padding: 8, border: "1px solid #ccc", borderRadius: 8 }} />
        <input value={service} onChange={e=>setService(e.target.value)} placeholder="Service (optional: Roofing)"
          style={{ flex: "1 1 180px", padding: 8, border: "1px solid #ccc", borderRadius: 8 }} />
        <button disabled={loading} style={{ padding:"8px 12px", borderRadius:8, background:"black", color:"white", border:"none" }}>
          {loading ? "Searching…" : "Find Top Pros"}
        </button>
      </form>
      {msg && <p style={{color:"crimson", marginTop:8}}>{msg}</p>}
      {items.length > 0 && (
        <ul style={{marginTop:10, paddingLeft:18}}>
          {items.map(p => (
            <li key={p.id}>
              <a href={`/providers/${p.id}`}><strong>{p.name}</strong></a>
              {typeof p.rating === "number" ? <> — ⭐ {p.rating.toFixed(1)}</> : null}
              {p.service_type ? <> — {p.service_type}</> : null}
              {p.city ? <> — {p.city}</> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
