"use client";

import { useEffect, useRef, useState } from "react";

type Signed = { cloud_name: string; api_key: string; timestamp: number; signature: string };

export default function NewJobPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canUpload, setCanUpload] = useState<boolean>(true); // auto-detect later
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Must be logged in as client
    const token = localStorage.getItem("pairpro_token");
    if (!token) {
      alert("Please log in as a client to create a job.");
      window.location.href = "/auth/login";
      return;
    }
    // Probe upload signing (graceful if Cloudinary not set yet)
    (async () => {
      try {
        const r = await fetch(`${base}/uploads/sign`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) setCanUpload(false);
      } catch {
        setCanUpload(false);
      }
    })();
  }, [base]);

  async function uploadOne() {
    const token = localStorage.getItem("pairpro_token");
    if (!token) { alert("Not logged in."); return; }
    if (!fileRef.current) return;
    const file = fileRef.current.files?.[0];
    if (!file) return;

    setMsg("Uploading photo…");
    try {
      const sres = await fetch(`${base}/uploads/sign`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!sres.ok) throw new Error(await sres.text());
      const s: Signed = await sres.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", String(s.api_key));
      form.append("timestamp", String(s.timestamp));
      form.append("signature", s.signature);
      form.append("folder", "pairpro/jobs");

      const cloud = `https://api.cloudinary.com/v1_1/${s.cloud_name}/image/upload`;
      const cres = await fetch(cloud, { method: "POST", body: form });
      const data = await cres.json();
      if (!data?.secure_url) throw new Error("Upload failed");
      setPhotos((arr) => [...arr, data.secure_url]);
      setMsg(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      setMsg(e?.message || "Upload failed");
    }
  }

  async function submitJob(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("pairpro_token");
    if (!token) { alert("Not logged in."); return; }
    if (!title.trim() || !serviceType.trim() || !city.trim()) {
      alert("Please complete Title, Service Type, and City.");
      return;
    }
    setMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${base}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          service_type: serviceType.trim(),
          city: city.trim(),
          description: desc.trim() || null,
          photo_urls: photos,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const job = await res.json();
      alert("Job created!");
      window.location.href = `/jobs/${job.id}`;
    } catch (e: any) {
      setMsg(e?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Create a Job (Hire)</h1>
      <p style={{opacity:0.7, marginTop:4}}>Tell pros what you need and (optionally) add photos.</p>

      <form onSubmit={submitJob} style={{ display: "grid", gap: 12, maxWidth: 560, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 4 }}>
          Title
          <input value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="e.g., Paint living room"
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 4 }}>
            Service Type
            <input value={serviceType} onChange={(e)=>setServiceType(e.target.value)} required placeholder="e.g., Painting"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            City
            <input value={city} onChange={(e)=>setCity(e.target.value)} required placeholder="e.g., Miami"
              style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }} />
          </label>
        </div>

        <label style={{ display: "grid", gap: 4 }}>
          Description (optional)
          <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} rows={5}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }} />
        </label>

        <div>
          <strong>Photos</strong>{" "}
          {!canUpload && <span style={{color:"crimson"}}>(Uploads disabled until Cloudinary is configured)</span>}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
            <input ref={fileRef} type="file" accept="image/*" disabled={!canUpload} />
            <button type="button" onClick={uploadOne} disabled={!canUpload}
              style={{ padding: "8px 12px", borderRadius: 8, cursor: canUpload ? "pointer" : "not-allowed" }}>
              Upload
            </button>
          </div>
          {photos.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              {photos.map((u, i) => (
                <img key={i} src={u} alt={`photo ${i}`} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }} />
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting}
          style={{ padding: "12px 18px", borderRadius: 10, border: "none", background: "black", color: "white" }}>
          {submitting ? "Creating…" : "Create Job"}
        </button>
      </form>

      {msg && <p style={{ color: "crimson", marginTop: 10 }}>{msg}</p>}
    </main>
  );
}
