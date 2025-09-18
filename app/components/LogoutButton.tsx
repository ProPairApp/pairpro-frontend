// app/components/LogoutButton.tsx
"use client";

export default function LogoutButton({ redirect = "/" }: { redirect?: string }) {
  return (
    <button
      className="btn"
      onClick={() => {
        try {
          localStorage.removeItem("pairpro_token");
        } catch {}
        window.location.href = redirect;
      }}
    >
      Sign out
    </button>
  );
}
