import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/ui/PriceTicker";
import BackgroundCanvas from "@/components/ui/BackgroundCanvas";

export const metadata: Metadata = {
  title: { default:"pokédax — Deine Karten. Ihr wahrer Wert.", template:"%s · pokédax" },
  description:"Live Cardmarket EUR-Preise, KI-Scanner und Portfolio-Tracking für Pokémon TCG. Deutschlands präziseste Plattform für ernsthafte Sammler.",
  keywords:["Pokémon TCG","Preischeck","Cardmarket","Scanner","Portfolio","pokédax"],
  openGraph:{
    title:"pokédax — Deine Karten. Ihr wahrer Wert.",
    description:"Live Cardmarket EUR-Preise, KI-Scanner und Portfolio-Tracking.",
    url:"https://pokedax2.vercel.app",
    siteName:"pokédax",
    locale:"de_DE",
    type:"website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://api.fontshare.com"/>
      </head>
      <body style={{ margin:0, background:"#0a0a0a" }}>
        <BackgroundCanvas intensity="medium"/>
        <div style={{ position:"relative", zIndex:1 }}>
          <Navbar/>
          <PriceTicker/>
          <main style={{ minHeight:"80vh" }}>{children}</main>
          <Footer/>
        </div>
      </body>
    </html>
  );
}
