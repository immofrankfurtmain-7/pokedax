/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.tcgdex.net" },
      { protocol: "https", hostname: "images.tcgdex.net" },
      { protocol: "https", hostname: "tcgdex.net" },
      { protocol: "https", hostname: "www.tcgdex.net" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["pokedax2.vercel.app"] },
  },
};

module.exports = nextConfig;
