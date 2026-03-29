import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";
import FloatingPikachu from "@/components/ui/FloatingPikachu";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Navbar />
        <BackgroundCanvas intensity="medium" />
        <FloatingPikachu />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
