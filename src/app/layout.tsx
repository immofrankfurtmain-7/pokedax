// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

export const metadata: Metadata = {
  title: "PokéDax – Quiet Luxury Pokémon TCG",
  description: "Live Cardmarket-Preise. Präzise. Elegant. Ohne Kompromisse.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="dark">
      <body className="bg-[var(--canvas)] text-[var(--tx-1)] overflow-x-hidden">
        <BackgroundCanvas intensity="low" />

        <div className="relative z-10">
          <Navbar />
          <PriceTicker />
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}