"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: number; email: string; role: "client" | "provider" };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("pairpro_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        setError("Not logged in");
        localStorage.removeItem("pairpro_token");
        router.push("/auth/login");
      });
  }, [router]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <main>
      <h1>Welcome, {user.email}</h1>
      <p>Role: {user.role}</p>
      <button
        onClick={() => {
          localStorage.removeItem("pairpro_token");
          router.push("/auth/login");
        }}
      >
        Sign out
      </button>
    </main>
  );
}
