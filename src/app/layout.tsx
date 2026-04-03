import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";

export const metadata: Metadata = {
  title: "PokéDax – Deine Karten. Ihr wahrer Wert.",
  description: "Quiet Luxury Pokémon TCG • Live Cardmarket • KI-Scanner • Portfolio • Fantasy League",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body>
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