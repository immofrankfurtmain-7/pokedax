import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingPikachu from "@/components/ui/FloatingPikachu";

export const metadata: Metadata = {
  title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Navbar />

        <FloatingPikachu />

        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
