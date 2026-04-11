import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default:"pokédax — Deine Karten. Ihr wahrer Wert.", template:"%s · pokédax" },
  description:"Live Cardmarket EUR-Preise, KI-Scanner und Portfolio-Tracking für Pokémon TCG Sammler.",
  keywords:["Pokémon TCG","Preischeck","Cardmarket","Scanner","Portfolio","pokédax","Karten kaufen","Karten verkaufen"],
  authors:[{name:"pokédax"}],
  creator:"pokédax",
  openGraph:{
    title:"pokédax — Deine Karten. Ihr wahrer Wert.",
    description:"Live Cardmarket EUR-Preise, KI-Scanner, sicherer Marktplatz und Portfolio-Tracking für Pokémon TCG.",
    url:"https://pokedax2.vercel.app",
    siteName:"pokédax",
    locale:"de_DE",
    type:"website",
  },
  twitter:{
    card:"summary_large_image",
    title:"pokédax",
    description:"Live Cardmarket EUR-Preise für Pokémon TCG.",
  },
  manifest:"/manifest.webmanifest",
  appleWebApp:{
    capable:true,
    statusBarStyle:"black-translucent",
    title:"pokédax",
  },
  icons: { icon: "/favicon.svg", apple: "/icon-192.svg" },
  themeColor:"#D4A843",
  viewport:{width:"device-width",initialScale:1,maximumScale:1},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous"/>
      </head>
      <body style={{background:"#09090b"}}>
        <Navbar/>
        <main style={{ minHeight:"70vh" }}>{children}</main>
        <Footer/>
      </body>
    </html>
  );
}
