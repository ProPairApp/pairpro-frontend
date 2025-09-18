// app/layout.tsx
import "./globals.css";
import React from "react";
import Header from "./components/Header";

export const metadata = {
  title: "PairPro",
  description: "Pairing homeowners with trusted pros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Shared header with buttons */}
        <Header />

        <main>{children}</main>

        <footer style={{ marginTop: 48, textAlign: "center", opacity: 0.6 }}>
          © {new Date().getFullYear()} PairPro
        </footer>
      </body>
    </html>
  );
}
