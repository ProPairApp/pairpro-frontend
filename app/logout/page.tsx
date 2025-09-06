"use client";

import { useEffect } from "react";

export default function LogoutRootPage() {
  useEffect(() => {
    try { localStorage.removeItem("pairpro_token"); } catch {}
    window.location.replace("/"); // or "/providers"
  }, []);
  return (
    <main>
      <p>Signing you out…</p>
      <p><a href="/">Go home</a></p>
    </main>
  );
}
