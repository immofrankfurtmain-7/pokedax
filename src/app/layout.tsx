import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
  keywords: ["Pokémon TCG", "Preischeck", "Cardmarket", "Karten Scanner", "Portfolio"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body style={{ margin: 0 }}>
        {/* Canvas sits behind everything at z-index 0 */}
        <BackgroundCanvas intensity="medium" />
        {/* All page content needs z-index > 0 to appear above canvas */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />
          <PriceTicker />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
