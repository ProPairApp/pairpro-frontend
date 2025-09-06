"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    try {
      localStorage.removeItem("pairpro_token");
      alert("You are signed out.");
    } finally {
      window.location.href = "/"; // or "/providers"
    }
  }, []);

  return (
    <main>
      <p>Signing you out…</p>
      <p><a href="/">Go home</a></p>
    </main>
  );
}
