"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://pairpro-backend-vyh1.onrender.com";

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

  // new: capture precise errors
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadDebug, setLoadDebug] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reviewCount = useMemo(() => reviews.length, [reviews]);
  const provUrl = `${BASE}/providers/${providerId}`;
  const revsUrl = `${BASE}/providers/${providerId}/reviews`;

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
      const [provRes, revRes] = await Promise.all([
        fetch(provUrl, { cache: "no-store", mode: "cors" }),
        fetch(revsUrl, { cache: "no-store", mode: "cors" }),
      ]);

      if (!provRes.ok) {
        const txt = await provRes.text().catch(() => "");
        const msg = `GET ${provUrl} → ${provRes.status} ${provRes.statusText} ${txt ? `| body: ${txt}` : ""}`;
        setLoadError("Provider load failed");
        setLoadDebug(msg);
        setProvider(null);
      } else {
        setProvider(await provRes.json());
      }

      if (!revRes.ok) {
        const txt = await revRes.text().catch(() => "");
        const msg = `GET ${revsUrl} → ${revRes.status} ${revRes.statusText} ${txt ? `| body: ${txt}` : ""}`;
        setLoadDebug((prev) => (prev ? prev + " || " + msg : msg));
        setReviews([]);
      } else {
        const revs: Review[] = await revRes.json();
        revs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setReviews(revs);
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
  if (submitting || !Number.isFinite(providerId)) return;

  setSubmitting(true);
  setSubmitError(null);

  // 1) snapshot current count (to detect success even if fetch throws)
  const beforeCount = reviews.length;

  try {
    const body = { stars: Number(stars), ...(comment.trim() ? { comment: comment.trim() } : {}) };

    // keepalive helps avoid "fetch aborted" when the tab is busy
    const res = await fetch(`${BASE}/providers/${providerId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      mode: "cors",
      keepalive: true,
      cache: "no-store",
    });

    if (!res.ok) {
      // try to read the body for a clearer error
      let txt = "";
      try { txt = await res.text(); } catch {}
      throw new Error(`POST ${res.status} ${res.statusText}${txt ? ` | ${txt}` : ""}`);
    }

    // 2) success path
    setComment("");
    await load();
    alert("Review added!");
 } catch (err: any) {
  // check if review actually got saved
  await load();
  if (reviews.length > beforeCount) {
    // review is there → success, no error
    setComment("");
    alert("Review added! (network was noisy, but it worked)");
    setSubmitError(null);
  } else {
    console.error("Submit error:", err);
    setSubmitError("Could not save review. Please try again.");
  }
}

    console.error("Submit error:", err);
    setSubmitError((err?.message || "Failed to submit review") + " — check Network tab for details");
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
