import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéDax – Präzise Pokémon TCG Preise",
  description: "Live Cardmarket EUR Preise. KI-Scanner. Portfolio. Minimal, edel, immer aktuell.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="bg-[var(--bg-base)] text-[var(--tx-1)] antialiased">
        {/* Canvas stays behind everything */}
        <BackgroundCanvas intensity="medium" />

        <div className="relative z-10">
          <Navbar />
          <PriceTicker />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}