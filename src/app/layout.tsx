import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéDax — Präzise. Edel. Immer aktuell.",
  description: "Live Cardmarket EUR Preise. KI-Scanner. Portfolio. Für Sammler, die es ernst meinen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="bg-[var(--bg-base)] text-[var(--tx-1)] antialiased">
        <Navbar />
        <PriceTicker />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}