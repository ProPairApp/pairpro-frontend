"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../lib/api"; // unified backend base

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

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Ask backend for a Cloudinary signature (cookie auth)
  async function signUpload(): Promise<{
    cloud_name: string;
    api_key: string;
    timestamp: number;
    signature: string;
  }> {
    const r = await fetch(`${API_BASE}/uploads/sign`, {
      method: "POST",
      credentials: "include", // <-- send session cookie
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  // Upload one file to Cloudinary using the signature
  async function uploadToCloudinary(file: File): Promise<string> {
    const sig = await signUpload();
    const url = `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`;

    const fd = new FormData();
    fd.set("file", file);
    fd.set("api_key", sig.api_key);
    fd.set("timestamp", String(sig.timestamp));
    fd.set("signature", sig.signature);
    // NOTE: If you later include extra params (e.g., folder=jobs),
    // they MUST also be part of the signing string on the backend.

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
      if (!title.trim()) {
        setMsg("Title is required");
        setSubmitting(false);
        return;
      }

      // Upload up to 6 photos (gracefully continue if any fail)
      const photo_urls: string[] = [];
      if (files && files.length > 0) {
        for (const file of Array.from(files).slice(0, 6)) {
          try {
            const url = await uploadToCloudinary(file);
            photo_urls.push(url);
          } catch (err) {
            console.warn("Upload failed, skipping this photo:", err);
          }
        }
        setPreview(photo_urls);
      }

      // Create the job (cookie auth)
      const body = {
        title: title.trim(),
        service_type: serviceType.trim(),
        city: city.trim(),
        description: description.trim() || undefined,
        photo_urls,
      };

      const r = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- send session cookie
        body: JSON.stringify(body),
      });

      if (!r.ok) throw new Error((await r.text()) || "Create job failed");

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
    <main style={{ maxWidth: 720, margin: "20px auto", padding: 12 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Create Job</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
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
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
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

        {msg && <p style={{ color: "crimson", marginTop: 4 }}>{msg}</p>}
      </form>

      {preview.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Uploaded:</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {preview.map((u) => (
              <img
                key={u}
                src={u}
                alt="uploaded"
                style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 6 }}
              />
            ))}
          </div>
        </>
      )}

      <p style={{ opacity: 0.7, marginTop: 12, fontSize: 12 }}>
        Tip: you must be logged in as a <strong>client</strong> to create a job.
      </p>

      <p style={{ opacity: 0.6, fontSize: 12, marginTop: 8 }}>
        debug: {API_BASE}/jobs
      </p>
    </main>
  );
}
