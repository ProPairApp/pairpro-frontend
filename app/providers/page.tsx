async function getProviders() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}/providers`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProvidersPage() {
  const providers = await getProviders();

  return (
    <main>
      <h1 style={{ fontSize: "28px", marginBottom: 12 }}>Browse Providers</h1>
      {providers.length === 0 ? (
        <p>No providers yet.</p>
      ) : (
        <ul>
          {providers.map((p: any) => (
            <li key={p.id}>
              <strong>{p.name}</strong>
              {p.service_type ? ` — ${p.service_type}` : ""}
              {p.city ? ` — ${p.city}` : ""}
              {typeof p.rating === "number" ? ` — ⭐ ${p.rating}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
