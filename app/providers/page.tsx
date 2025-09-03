"use client";

import { useState, useEffect } from "react";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [serviceType, setServiceType] = useState("");

  async function fetchProviders(filters: { city?: string; service_type?: string } = {}) {
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_URL!;
    const params = new URLSearchParams();
    if (filters.city) params.append("city", filters.city);
    if (filters.service_type) params.append("service_type", filters.service_type);

    const res = await fetch(`${base}/providers?${params.toString()}`, { cache: "no-store" });
    const data = res.ok ? await res.json() : [];
    setProviders(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProviders();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProviders({
      city: city.trim(),
      service_type: serviceType.trim(),
    });
  }

  return (
    <main>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Browse Providers</h1>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city"
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <input
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          placeholder="Filter by service"
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button
          type="submit"
          style={{ padding: "8px 12px", background: "black", color: "white", borderRadius: 6 }}
        >
          Search
        </button>
      </form>

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
            {providers.map((p: any) => (
              <tr key={p.id}>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  <strong>{p.name}</strong>
                </td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  {p.service_type ?? ""}
                </td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  {p.city ?? ""}
                </td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  {typeof p.rating === "number" ? `⭐ ${p.rating}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
