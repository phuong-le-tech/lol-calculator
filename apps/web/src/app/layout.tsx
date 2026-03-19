import type { Metadata } from "next";
import { Russo_One, Chakra_Petch } from "next/font/google";
import "./globals.css";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo-one",
});

const chakraPetch = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra-petch",
});

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
    <html lang="en" className={`dark ${russoOne.variable} ${chakraPetch.variable}`}>
      <body className="min-h-screen bg-dark-600 text-dark-100 antialiased">
        {children}
      </body>
    </html>
  );
}
