"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  id: number; title: string; service_type: string; city: string;
  description?: string | null; status: string; provider_id?: number | null; created_at: string;
  photos?: string[];
};
type PlanItem = { id: number; text: string; done: boolean; created_at: string };

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = useMemo(() => Number(params.id), [params.id]);
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [job, setJob] = useState<Job | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [newPlan, setNewPlan] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pairpro_token");
    if (!token) { window.location.href = "/auth/login"; return; }
    (async () => {
      try {
        const jr = await fetch(`${base}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!jr.ok) throw new Error(await jr.text());
        setJob(await jr.json());

        const pr = await fetch(`${base}/jobs/${jobId}/plans`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!pr.ok) throw new Error(await pr.text());
        setPlans(await pr.json());
      } catch (e: any) {
        setMsg(e?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    })();
  }, [base, jobId]);

  async function addPlan(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("pairpro_token");
    if (!token) { alert("Not logged in."); return; }
    if (!newPlan.trim()) return;
    setMsg(null);
    try {
      const r = await fetch(`${base}/jobs/${jobId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newPlan.trim() }),
      });
      if (!r.ok) throw new Error(await r.text());
      const item: PlanItem = await r.json();
      setPlans((arr) => [...arr, item]);
      setNewPlan("");
    } catch (e: any) {
      setMsg(e?.message || "Failed to add item");
    }
  }

  if (loading) return <main><p>Loading…</p></main>;
  if (!job) return <main><p>Job not found.</p></main>;

  return (
    <main>
      <h1>{job.title}</h1>
      <p style={{opacity:0.7, marginTop:4}}>
        {job.service_type} in {job.city} — <em>{job.status}</em>
        {job.provider_id ? <> — Provider: <a href={`/providers/${job.provider_id}`}>#{job.provider_id}</a></> : null}
      </p>

      {job.description && <p style={{ marginTop: 12 }}>{job.description}</p>}

      {job.photos && job.photos.length > 0 && (
        <>
          <h3 style={{ marginTop: 20 }}>Photos</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {job.photos.map((u, i) => (
              <img key={i} src={u} alt={`photo ${i}`} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
            ))}
          </div>
        </>
      )}

      <h3 style={{ marginTop: 24 }}>Plan</h3>
      {plans.length === 0 ? <p>No items yet.</p> : (
        <ul style={{ paddingLeft: 18 }}>
          {plans.map(p => (
            <li key={p.id} style={{ marginBottom: 6 }}>
              {p.done ? "✅" : "⬜️"} {p.text}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addPlan} style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={newPlan} onChange={(e)=>setNewPlan(e.target.value)} placeholder="Add a plan item…"
          style={{ flex: 1, padding: 10, border: "1px solid #ccc", borderRadius: 8 }} />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, background: "black", color: "white", border: "none" }}>
          Add
        </button>
      </form>

      {msg && <p style={{ color: "crimson", marginTop: 10 }}>{msg}</p>}
    </main>
  );
}
