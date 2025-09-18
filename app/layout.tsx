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
        {/* Shared Header */}
        <Header />

        {/* Main page content */}
        <main>{children}</main>

        {/* Footer */}
        <footer style={{ marginTop: 48, opacity: 0.6, textAlign: "center" }}>
          © {new Date().getFullYear()} PairPro
        </footer>
      </body>
    </html>
  );
}
