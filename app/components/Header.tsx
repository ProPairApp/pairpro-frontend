// app/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <h1>PairPro</h1>

      <nav aria-label="Primary">
        <Link href="/">Home</Link>
        <Link href="/providers">Providers</Link>
        <Link href="/jobs/new">Create Job</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/providers/new">Add Provider</Link>
      </nav>

      <div>
        {hasToken ? (
          <LogoutButton redirect="/" />
        ) : (
          <>
            <Link href="/auth/login" style={{ marginRight: 10 }}>
              Log in
            </Link>
            <Link href="/auth/signup">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
