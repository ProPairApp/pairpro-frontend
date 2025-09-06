import type { Metadata } from "next";
import Header from "./components/Header";

export const metadata: Metadata = {
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
      <body
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <Header />  {/* ✅ dynamic header with Dashboard + auth links */}

        {children}

        <footer style={{ marginTop: 48, opacity: 0.6 }}>
          © {new Date().getFullYear()} PairPro
        </footer>
      </body>
    </html>
  );
}
