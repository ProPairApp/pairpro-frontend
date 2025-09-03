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
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Browse Providers</h1>

      {providers.length === 0 ? (
        <p>No providers yet.</p>
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

      <p style={{ marginTop: 16 }}>
        Want to add one? <a href="/providers/new">Add Provider</a>
      </p>
    </main>
  );
}

