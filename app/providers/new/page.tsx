"use client";

import { useState } from "react";

export default function NewProviderPage() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState<string>("");
  const [serviceType, setServiceType] = useState("");
  const [city, setCity] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a provider name.");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;
    if (!token) {
      alert("Please log in as a provider to add your profile.");
      window.location.href = "/auth/login";
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_URL!;
    const body: any = { name: name.trim() };
    if (rating !== "") body.rating = Number(rating);
    if (serviceType.trim() !== "") body.service_type = serviceType.trim();
    if (city.trim() !== "") body.city = city.trim();

    const res = await fetch(`${base}/providers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Provider saved!");
      setName("");
      setRating("");
      setServiceType("");
      setCity("");
    } else {
      const msg = await res.text();
      alert("Failed to save provider: " + msg);
    }
  }

  return (
    <main>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Add Provider</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label style={{ display: "grid", gap: 4 }}>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Maria Roofing"
            required
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Service Type (optional)
          <input
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            placeholder="e.g., Roofing, Painting, Siding"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          City (optional)
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Miami"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label style={{ display: "grid", gap: 4 }}>
          Rating (0–5, optional)
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="e.g., 4.8"
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: "black",
            color: "white",
            cursor: "pointer",
          }}
        >
          Save Provider
        </button>
      </form>
    </main>
  );
}
