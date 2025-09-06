"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    try {
      localStorage.removeItem("pairpro_token");
      alert("You are signed out.");
    } finally {
      window.location.href = "/"; // send them home (or /providers)
    }
  }, []);
  return <main><p>Signing you out…</p></main>;
}
