// app/layout.tsx
import "./globals.css";
import React from "react";

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
        <header>
          <h1>PairPro</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/providers">Providers</a>
            <a href="/providers/new">Add Provider</a>
            <a href="/jobs/new">Create Job</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/auth/login">Log in</a>
            <a href="/auth/signup">Sign up</a>
          </nav>
        </header>

        <main>{children}</main>

        <footer>© {new Date().getFullYear()} PairPro</footer>
      </body>
    </html>
  );
}
