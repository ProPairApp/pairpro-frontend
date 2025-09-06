"use client";

import LogoutButton from "./LogoutButton";

export default function Header() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pairpro_token") : null;

  return (
    <header style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
      <a href="/">Home</a>
      <a href="/providers">Providers</a>
      <a href="/dashboard">Dashboard</a>
      <span style={{ marginLeft: "auto" }}>
        {token ? (
          <LogoutButton redirect="/" />
        ) : (
          <>
            <a href="/auth/login" style={{ marginRight: 8 }}>Log in</a>
            <a href="/auth/signup">Sign up</a>
          </>
        )}
      </span>
    </header>
  );
}
