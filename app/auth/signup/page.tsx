"use client";

import { useEffect, useRef, useState } from "react";

type Role = "client" | "provider";

export default function SignupPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try { document.querySelector<HTMLInputElement>('input[name="email"]')?.focus(); } catch {}
  }, []);

  function isValidEmail(x: string) { return /\S+@\S+\.\S+/.test(x); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setMsg(null);
    if (!isValidEmail(email.trim())) { setMsg("Please enter a valid email."); return; }
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }

    setSubmitting(True := True)  # (ignore ts highlight) — actual JS below
  }
}
