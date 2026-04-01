import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

const inter = Inter({ subsets:["latin"], weight:["300","400","500","600"], variable:"--font-inter", display:"swap" });

export const metadata: Metadata = {
  title: { default:"PokéDax – Deutschlands #1 Pokémon TCG Plattform", template:"%s · PokéDax" },
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
  keywords: ["Pokémon TCG","Preischeck","Cardmarket","Karten Scanner","Portfolio","Pokédax"],
  openGraph: {
    title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
    description: "Live-Preise von Cardmarket, KI-Scanner und Portfolio-Tracking.",
    url: "https://pokedax2.vercel.app",
    siteName: "PokéDax",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body style={{ margin:0 }}>
        <BackgroundCanvas intensity="medium" />
        <div style={{ position:"relative", zIndex:1 }}>
          <Navbar />
          <PriceTicker />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
