// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "pokédax",
    short_name: "pokédax",
    description: "Deine Karten. Ihr wahrer Wert.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#D4A843",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
    ],
    screenshots: [
      { src: "/screenshot-mobile.png", sizes: "390x844", type: "image/png" },
    ],
    categories: ["finance", "utilities"],
    lang: "de",
  };
}
