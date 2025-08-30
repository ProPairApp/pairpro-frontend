"use client";

import { useState } from "react";

export default function NewProviderPage() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState<string>(""); // keep as string for input

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // simple validation
    if (!name.trim()) {
      alert("Please enter a provider name.");
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_URL!;
    const body = {
      name: name.trim(),
      // if rating is blank, send nothing; else send a number
      ...(rating !== "" ? { rating: Number(rating) } : {})
    };

    const res = await fetch(`${base}/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Provider saved!");
      setName("");
      setRating("");
    } else {
      const msg = await res.text();
      alert("Failed to save provider: " + msg);
    }
  }

  return (
    <main>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Add Provider</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
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
      <p style={{ marginTop: 16 }}>
        After saving, visit <a href="/providers">/providers</a> to see it live.
      </p>
    </main>
  );
}
