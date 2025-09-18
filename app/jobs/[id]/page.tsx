"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => Number(params?.id), [params]);

  const [job, setJob] = useState<JobDetail | null>(null);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [adding, setAdding] = useState(false);

  const baseRaw = process.env.NEXT_PUBLIC_API_URL || "";
  const base = useMemo(() => baseRaw.replace(/\/+$/, ""), [baseRaw]);

  function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
  }

  async function fetchAuthed(path: string, init: RequestInit = {}) {
    const token = getToken();
    if (!token) throw new Error("Not logged in.");
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (res.status === 401) {
      // token expired or missing -> send to login
      router.push("/auth/login");
      throw new Error("Not authenticated.");
    }
    if (!res.ok) throw new Error(await res.text());
    return res;
  }

  useEffect(() => {
    if (!Number.isFinite(jobId)) {
      setErr("Invalid job id.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const [jobRes, plansRes] = await Promise.all([
          fetchAuthed(`/jobs/${jobId}`),
          fetchAuthed(`/jobs/${jobId}/plans`),
        ]);

        const jobJson: JobDetail = await jobRes.json();
        const plansJson: PlanItem[] = await plansRes.json();
        setJob(jobJson);
        setPlans(plansJson);
      } catch (e: any) {
        setErr(e?.message || "Failed to load job.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, base]);

  async function addPlanItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlan.trim() || adding) return;
    try {
      setAdding(true);
      const r = await fetchAuthed(`/jobs/${jobId}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newPlan.trim() }),
      });
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
  if (err) return (
    <div>
      <p style={{ color: "crimson" }}>{err}</p>
      <button
        onClick={() => location.reload()}
        style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6 }}
      >
        Retry
      </button>
    </div>
  );
  if (!job) return <p>Job not found.</p>;

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{job.title}</h1>
      <p style={{ opacity: 0.7, marginTop: -8 }}>
        {job.service_type} • {job.city} • status: <strong>{job.status}</strong>
      </p>

      {job.description && <p>{job.description}</p>}

      {Array.isArray(job.photos) && job.photos.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 8 }}>
          {job.photos.map((u, i) => (
            <img
              key={i}
              src={u}
              alt={`photo ${i + 1}`}
              style={{ width: "100%", borderRadius: 8, objectFit: "cover" }}
              loading="lazy"
            />
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
