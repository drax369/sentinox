import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import { CustomCursor } from "@/components/effects/CustomCursor";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sentinox — AI Healthcare Intelligence",
  description:
    "Next-generation healthcare AI platform for product analysis, ingredient breakdown, and personalized health education.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} h-full`}>
      <body
        className="min-h-full font-[family-name:var(--font-rajdhani)] antialiased"
        style={{ fontFamily: "var(--font-rajdhani), system-ui" }}
      >
        <AppProviders>
          <CustomCursor />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
