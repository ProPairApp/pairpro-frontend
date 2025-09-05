"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://pairpro-backend-vyh1.onrender.com"; // fallback so it always works

type Provider = {
  id: number;
  name: string;
  rating?: number | null;
  service_type?: string | null;
  city?: string | null;
};

type Review = {
  id: number;
  provider_id: number;
  stars: number;
  comment?: string | null;
  created_at: string;
};

export default function ProviderDetailPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const providerId = Number.parseInt(String(idParam ?? ""), 10);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [stars, setStars] = useState<string>("5");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // precise errors for load + submit (for real failures only)
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadDebug, setLoadDebug] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reviewCount = useMemo(() => reviews.length, [reviews]);
  const provUrl = `${BASE}/providers/${providerId}`;
  const revsUrl = `${BASE}/providers/${providerId}/reviews`;

  function sortNewestFirst(arr: Review[]) {
    return [...arr].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async function fetchProvider(): Promise<Provider | null> {
    const res = await fetch(provUrl, { cache: "no-store", mode: "cors" });
    if (!res.ok) return null;
    return res.json();
  }

  async function fetchReviews(): Promise<Review[]> {
    const res = await fetch(revsUrl, { cache: "no-store", mode: "cors" });
    if (!res.ok) return [];
    const data: Review[] = await res.json();
    return sortNewestFirst(data);
  }

  async function load() {
    if (!Number.isFinite(providerId)) {
      setLoadError("Invalid provider id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    setLoadDebug(null);
    try {
      const [prov, revs] = await Promise.all([fetchProvider(), fetchReviews()]);
      setProvider(prov);
      setReviews(revs);
      if (!prov) {
        setLoadError("Provider load failed");
        setLoadDebug(`GET ${provUrl} → not ok`);
      }
    } catch (e: any) {
      setLoadError(e?.message || "Network error during load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

async function submitReview(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (submitting) return;
  setSubmitting(true);
  setError(null);
  try {
    const body = { stars: Number(stars), ...(comment.trim() ? { comment: comment.trim() } : {}) };
    const res = await fetch(`${base}/providers/${providerId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Request failed: ${res.status}`);
    }

    // ✅ POST worked — tell the user now
    alert("Review added!");
    setComment("");

    // 🔄 Try to refresh, but don't error out if it fails
    try {
      await load();
    } catch {
      // ignore; page will still have the new review on next navigation/refresh
    }
  } catch (e: any) {
    setError(e.message || "Failed to submit review");
  } finally {
    setSubmitting(false);
  }
}
  const debugTop = `api: ${BASE} · idParam: ${idParam ?? "(none)"} · parsedId: ${
    Number.isFinite(providerId) ? providerId : "NaN"
  }`;

  if (!Number.isFinite(providerId)) {
    return (
      <main>
        <p style={{ opacity: 0.6, fontSize: 12 }}>{debugTop}</p>
        <p>Invalid provider URL. Go back to <a href="/providers">/providers</a> and click a name.</p>
      </main>
    );
  }

  return (
    <main>
      <p style={{ opacity: 0.6, fontSize: 12 }}>
        {debugTop} · urls: <a href={provUrl} target="_blank" rel="noreferrer">{provUrl}</a> &nbsp;/&nbsp;
        <a href={revsUrl} target="_blank" rel="noreferrer">{revsUrl}</a>
      </p>

      <a href="/providers" style={{ display: "inline-block", marginBottom: 12 }}>← Back to list</a>

      {loading ? (
        <p>Loading…</p>
      ) : !provider ? (
        <>
          <p style={{ color: "crimson" }}>Provider not found.</p>
          {loadError && <p style={{ color: "crimson" }}>Error: {loadError}</p>}
          {loadDebug && <p style={{ color: "#555" }}>Details: {loadDebug}</p>}
        </>
      ) : (
        <>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>
            {provider.name}{" "}
            <span style={{ fontSize: 16, fontWeight: 400, opacity: 0.7 }}>
              (Reviews: {reviewCount})
            </span>
          </h1>
          <p style={{ margin: 0 }}>
            {provider.service_type || "—"} · {provider.city || "—"} ·{" "}
            {typeof provider.rating === "number" ? `⭐ ${provider.rating.toFixed(1)}` : "No rating yet"}
          </p>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20 }}>Add a Review</h2>
            <form onSubmit={submitReview} style={{ display: "grid", gap: 10, maxWidth: 480 }}>
              <label style={{ display: "grid", gap: 4 }}>
                Stars (1–5)
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={stars}
                  onChange={(e) => setStars(e.target.value)}
                  style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: 4 }}>
                Comment (optional)
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience…"
                  rows={3}
                  style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: submitting ? "#666" : "black",
                  color: "white",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>

              {submitError && <p style={{ color: "crimson" }}>Submit error: {submitError}</p>}
            </form>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Reviews</h2>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>⭐ {r.stars}</div>
                    <div style={{ marginTop: 4 }}>{r.comment || "(no comment)"}</div>
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
