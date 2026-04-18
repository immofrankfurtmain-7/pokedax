const fs = require('fs'), path = require('path');
const root = 'C:\\Users\\lenovo\\pokedax\\pokedax\\pokedax';

const layout = `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { template: "%s — pokédax", default: "pokédax" },
  description: "Deine Pokémon TCG Sammlung. Preise, Scanner, Marktplatz.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Navbar />
        <main style={{ paddingTop: 80 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
`;

fs.writeFileSync(path.join(root, 'src/app/layout.tsx'), layout, 'utf8');
console.log('layout.tsx fixed — Navbar restored');
