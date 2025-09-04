"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const providerId = Number(params.id);
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState<string>("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewCount = useMemo(() => reviews.length, [reviews]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [provRes, revRes] = await Promise.all([
        fetch(`${base}/providers/${providerId}`, { cache: "no-store" }),
        fetch(`${base}/providers/${providerId}/reviews`, { cache: "no-store" }),
      ]);
      setProvider(provRes.ok ? await provRes.json() : null);
      const revs: Review[] = revRes.ok ? await revRes.json() : [];
      revs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReviews(revs);
    } catch (e: any) {
      setError(e.message || "Failed to load");
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
        const txt = await res.text();
        throw new Error(txt || `Request failed: ${res.status}`);
      }
      setComment("");
      await load(); // refresh provider + reviews
      alert("Review added!");
    } catch (e: any) {
      setError(e.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main><p>Loading...</p></main>;
  if (!provider) return <main><p>Provider not found.</p></main>;

  return (
    <main>
      {/* 🔎 Debug line (shows which URL is being called) */}
      <p style={{ opacity: 0.6, fontSize: 12 }}>
        debug: {process.env.NEXT_PUBLIC_API_URL}/providers/{providerId}
      </p>

      <a href="/providers" style={{ display: "inline-block", marginBottom: 12 }}>← Back to list</a>

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

          {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
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
    </main>
  );
}
