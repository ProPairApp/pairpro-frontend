"use client";

import LogoutButton from "./LogoutButton";

export default function Header() {
  const hasToken =
    typeof window !== "undefined" && !!localStorage.getItem("pairpro_token");

  return (
    <header
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
      }}
    >
      <a href="/" style={{ fontWeight: 700 }}>PairPro</a>
      <a href="/providers">Providers</a>
      <a href="/dashboard">Dashboard</a>

      <span style={{ marginLeft: "auto" }}>
        {hasToken ? (
          <LogoutButton redirect="/" />
        ) : (
          <>
            <a href="/auth/login" style={{ marginRight: 10 }}>Log in</a>
            <a href="/auth/signup">Sign up</a>
          </>
        )}
      </span>
    </header>
  );
}
