"use client";

import { useEffect, useState } from "react";

type User = { id: number; email: string; role: "client" | "provider" };
type Job = {
  id: number; title: string; service_type: string; city: string;
  description?: string | null; status: string; provider_id?: number | null; created_at: string;
};

export default function DashboardPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("pairpro_token");
    if (!token) { window.location.href = "/auth/login"; return; }
    (async () => {
      try {
        const meRes = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!meRes.ok) throw new Error(await meRes.text());
        const me: User = await meRes.json();
        setUser(me);

        const jobsRes = await fetch(`${base}/jobs/mine`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!jobsRes.ok) throw new Error(await jobsRes.text());
        setJobs(await jobsRes.json());
      } catch (e: any) {
        setMsg(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [base]);

  if (loading) return <main><p>Loading…</p></main>;
  if (!user) return <main><p>Not logged in.</p></main>;

  return (
    <main>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Logged in as <strong>{user.email}</strong> ({user.role})</p>

      {user.role === "client" && (
        <>
          <p style={{ marginTop: 12 }}><a href="/jobs/new">+ Create a Job</a></p>
          <h2 style={{ marginTop: 20 }}>My Hires (Jobs)</h2>
          {jobs.length === 0 ? (
            <p>No jobs yet.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {jobs.map(j => (
                <li key={j.id} style={{ marginBottom: 10 }}>
                  <a href={`/jobs/${j.id}`}><strong>{j.title}</strong></a>
                  {" — "}{j.service_type} in {j.city} — <em>{j.status}</em>
                  {j.provider_id ? <> — Provider: <a href={`/providers/${j.provider_id}`}>#{j.provider_id}</a></> : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {user.role === "provider" && (
        <>
          <h2 style={{ marginTop: 20 }}>Assigned Jobs</h2>
          {jobs.length === 0 ? <p>No jobs assigned yet.</p> : (
            <ul style={{ paddingLeft: 18 }}>
              {jobs.map(j => (
                <li key={j.id} style={{ marginBottom: 10 }}>
                  <a href={`/jobs/${j.id}`}><strong>{j.title}</strong></a>
                  {" — "}{j.service_type} in {j.city} — <em>{j.status}</em>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {msg && <p style={{ color: "crimson", marginTop: 16 }}>Error: {msg}</p>}
    </main>
  );
}
