import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PokéDax – Deutschlands #1 Pokémon TCG Plattform",
  description: "Live Cardmarket EUR Preise, KI-Scanner, Portfolio und Community. Deutschlands größte Pokémon TCG Plattform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Navbar />

        {/* Pikachu Floaters – immer sichtbar */}
        <div className="pikachu-left" aria-hidden="true">
          <Image
            src="/pikachu-left.svg"
            alt=""
            width={80}
            height={80}
            priority
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="pikachu-right" aria-hidden="true">
          <Image
            src="/pikachu-right.svg"
            alt=""
            width={80}
            height={80}
            priority
            style={{ width: "100%", height: "auto", transform: "scaleX(-1)" }}
          />
        </div>

        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
