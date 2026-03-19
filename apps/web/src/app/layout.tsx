import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoL Damage Simulator",
  description:
    "Calculate champion damage output against configurable targets. Real-time DPS, combo damage, and time-to-kill breakdowns.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-600 text-dark-50 antialiased">
        {children}
      </body>
    </html>
  );
}
