"use client";

import { useEffect, useState } from "react";

type Provider = {
  id: number;
  name: string;
  rating?: number | null;
  service_type?: string | null;
  city?: string | null;
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function fetchProviders(filters: { city?: string; service_type?: string } = {}) {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL!;
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.service_type) params.append("service_type", filters.service_type);

      const url = `${base}/providers${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setProviders(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "Failed to load providers");
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // live (debounced) search
  useEffect(() => {
    const id = setTimeout(() => {
      fetchProviders({
        city: city.trim() || undefined,
        service_type: serviceType.trim() || undefined,
      });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, serviceType]);

  return (
    <main>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Browse Providers</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city (e.g., Miami)"
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <input
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          placeholder="Filter by service (e.g., Roofing)"
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          onClick={() => {
            setCity("");
            setServiceType("");
          }}
          style={{ padding: "8px 12px", background: "black", color: "white", borderRadius: 6 }}
          type="button"
        >
          Reset
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : providers.length === 0 ? (
        <p>No providers found.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 800 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Name</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Service</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>City</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id}>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  <strong>
                    <a
                      href={`/providers/${p.id}`}
                      style={{ color: "blue", textDecoration: "underline" }}
                    >
                      {p.name}
                    </a>
                  </strong>
                </td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{p.service_type ?? ""}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{p.city ?? ""}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  {typeof p.rating === "number" ? `⭐ ${p.rating}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 16 }}>
        Want to add one? <a href="/providers/new">Add Provider</a>
      </p>
    </main>
  );
}
