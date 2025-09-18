// app/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const read = () => setHasToken(!!localStorage.getItem("pairpro_token"));
    read();
    const onFocus = () => read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "pairpro_token") read();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <header>
      <strong>PairPro</strong>

      <nav>
        <a href="/">Home</a>
        <a href="/providers">Providers</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/jobs/new" className="btn">Create Job</a>
      </nav>

      <div style={{ display: "flex", gap: 8 }}>
        {hasToken ? (
          <LogoutButton redirect="/" />
        ) : (
          <>
            <a href="/auth/login" className="btn">Log in</a>
            <a href="/auth/signup" className="btn">Sign up</a>
          </>
        )}
      </div>
    </header>
  );
}
