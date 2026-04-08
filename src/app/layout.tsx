import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolisayAI | Policy & KOL Impact Analysis",
  description: "Advanced AI platform for analyzing political influence and policy impact across KR and JP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="sidebar-nav">
          <div style={{ padding: "0 1rem 2rem 1rem", fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
            PolisayAI
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <a href="/" className="glass" style={{ padding: "0.75rem 1rem", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>Dashboard</a>
            <a href="/kol" style={{ padding: "0.75rem 1rem" }}>KOL Boards</a>
            <a href="/politics" style={{ padding: "0.75rem 1rem" }}>Policy Tracking</a>
            <a href="/gap" style={{ padding: "0.75rem 1rem" }}>Gap Analysis</a>
            <a href="/admin/data" style={{ padding: "0.75rem 1rem", marginTop: "1rem", borderTop: "1px solid var(--border)", color: "var(--primary)" }}>Data Center</a>
          </nav>
          <div style={{ marginTop: "auto", padding: "1rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
            v0.1.0-alpha
          </div>
        </div>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
