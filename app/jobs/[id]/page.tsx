"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type JobDetail = {
  id: number;
  title: string;
  service_type: string;
  city: string;
  description?: string | null;
  status: string;
  provider_id?: number | null;
  created_at: string;
  photos: string[];
};

type PlanItem = {
  id: number;
  text: string;
  done: boolean;
  created_at: string;
};

const base = process.env.NEXT_PUBLIC_API_URL!;

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => Number(params?.id), [params]);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
        if (!token) throw new Error("Not logged in.");
        // job
        const r1 = await fetch(`${base}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r1.ok) throw new Error(await r1.text());
        const data: JobDetail = await r1.json();
        setJob(data);
        // plans
        const r2 = await fetch(`${base}/jobs/${jobId}/plans`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r2.ok) throw new Error(await r2.text());
        const items: PlanItem[] = await r2.json();
        setPlans(items);
      } catch (e: any) {
        setErr(e?.message || "Failed to load job.");
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  async function addPlanItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlan.trim() || adding) return;
    try {
      setAdding(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
      if (!token) throw new Error("Not logged in.");
      const r = await fetch(`${base}/jobs/${jobId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: newPlan.trim() }),
      });
      if (!r.ok) throw new Error(await r.text());
      const created: PlanItem = await r.json();
      setPlans((prev) => [...prev, created]);
      setNewPlan("");
    } catch (e: any) {
      alert(e?.message || "Failed to add plan item");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{job.title}</h1>
      <p style={{ opacity: 0.7, marginTop: -8 }}>
        {job.service_type} • {job.city} • status: <strong>{job.status}</strong>
      </p>

      {job.description && <p>{job.description}</p>}

      {job.photos?.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 8 }}>
          {job.photos.map((u, i) => (
            <img key={i} src={u} alt={`photo ${i + 1}`} style={{ width: "100%", borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <p style={{ opacity: 0.7 }}>No photos uploaded.</p>
      )}

      <section style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 18 }}>Plan</h2>
        {plans.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No items yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            {plans.map((p) => (
              <li key={p.id} style={{ margin: "6px 0" }}>
                {p.text}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addPlanItem} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            placeholder="Add a plan item…"
            style={{ flex: 1, padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
          <button
            type="submit"
            disabled={adding || !newPlan.trim()}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: adding || !newPlan.trim() ? "#777" : "black",
              color: "white",
              cursor: adding || !newPlan.trim() ? "default" : "pointer",
            }}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </section>

      <p style={{ opacity: 0.6, fontSize: 12 }}>
        debug: {base}/jobs/{jobId}
      </p>
    </main>
  );
}
