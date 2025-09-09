// app/layout.tsx
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
      <body>{children}</body>
    </html>
  );
}
