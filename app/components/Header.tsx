"use client";

import LogoutButton from "./LogoutButton";

export default function Header() {
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("pairpro_token");

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <strong>PairPro</strong>

      <nav style={{ display: "flex", gap: 12 }}>
        <a href="/">Home</a>
        <a href="/providers">Providers</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/providers/new">Add Provider</a>
      </nav>

      <div>
        {hasToken ? (
          <LogoutButton redirect="/" />
        ) : (
          <>
            <a href="/auth/login" style={{ marginRight: 10 }}>
              Log in
            </a>
            <a href="/auth/signup">Sign up</a>
          </>
        )}
      </div>
    </header>
  );
}
