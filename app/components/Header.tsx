"use client";

import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const read = () => setHasToken(!!localStorage.getItem("pairpro_token"));
    read();
    const onFocus = () => read();
    const onStorage = (e: StorageEvent) => { if (e.key === "pairpro_token") read(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 24}}>
      <strong>PairPro</strong>
      <nav style={{display:"flex", gap:12}}>
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
            <a href="/auth/login" style={{ marginRight: 10 }}>Log in</a>
            <a href="/auth/signup">Sign up</a>
          </>
        )}
      </div>
    </header>
  );
}
