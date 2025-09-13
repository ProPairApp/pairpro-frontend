"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type JobResp = {
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

const base = process.env.NEXT_PUBLIC_API_URL!; // e.g. https://pairpro-backend-vyh1.onrender.com

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  async function signUpload(): Promise<{ cloud_name: string; api_key: string; timestamp: number; signature: string }> {
    const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
    if (!token) throw new Error("Not logged in.");
    const r = await fetch(`${base}/uploads/sign`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function uploadToCloudinary(file: File): Promise<string> {
    // If Cloudinary isn’t configured on backend, this endpoint will 500.
    // We’ll catch and continue without photos.
    const sig = await signUpload();
    const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;
    const fd = new FormData();
    fd.set("file", file);
    fd.set("api_key", sig.api_key);
    fd.set("timestamp", String(sig.timestamp));
    fd.set("signature", sig.signature);

    const r = await fetch(url, { method: "POST", body: fd });
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    return data.secure_url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setMsg(null);
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
      if (!token) throw new Error("Please log in as a client.");

      // try uploading images if any were picked
      const photo_urls: string[] = [];
      if (files && files.length > 0) {
        for (const file of Array.from(files).slice(0, 6)) {
          try {
            const url = await uploadToCloudinary(file);
            photo_urls.push(url);
          } catch (e) {
            // If Cloudinary isn’t set up yet, skip photos gracefully.
            console.warn("Upload failed, continuing without photo:", e);
          }
        }
      }

      const body = {
        title: title.trim(),
        service_type: serviceType.trim(),
        city: city.trim(),
        description: description.trim() || undefined,
        photo_urls,
      };

      const r = await fetch(`${base}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || "Create job failed");
      }

      const job: JobResp = await r.json();
      router.push(`/jobs/${job.id}`);
    } catch (err: any) {
      setMsg(err?.message || "Something went wrong.");
      btnRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Create Job</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label style={{ display: "grid", gap: 4 }}>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Paint living room"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Service Type
          <input
            required
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="e.g., Painting"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          City
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Miami"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Description (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Tell the pro what you need…"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Photos (optional, up to 6)
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        </label>

        <button
          ref={btnRef}
          type="submit"
          disabled={submitting}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: submitting ? "#777" : "black",
            color: "white",
            cursor: submitting ? "default" : "pointer",
          }}
        >
          {submitting ? "Saving…" : "Create Job"}
        </button>

        {msg && (
          <p style={{ color: "crimson", marginTop: 4 }}>
            {msg}
          </p>
        )}
      </form>

      <p style={{ opacity: 0.7, marginTop: 12, fontSize: 12 }}>
        Tip: you must be logged in as a <strong>client</strong> to create a job.
      </p>
    </main>
  );
}
