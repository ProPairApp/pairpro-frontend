"use client";

export default function LogoutButton({ redirect = "/" }: { redirect?: string }) {
  return (
    <button
      onClick={() => {
        try { localStorage.removeItem("pairpro_token"); } catch {}
        window.location.href = redirect;
      }}
      style={{ padding: "8px 12px", borderRadius: 6 }}
    >
      Sign out
    </button>
  );
}
