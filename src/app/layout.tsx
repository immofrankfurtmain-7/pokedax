import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";

export const metadata: Metadata = {
  title: "PokéDax – Pokémon TCG, präzise & edel",
  description: "Live Cardmarket Preise. KI-Scanner. Portfolio. Fantasy League.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body>
        {/* Extrem subtiler Background */}
        <div className="background-canvas" />

        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />
          <PriceTicker />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}