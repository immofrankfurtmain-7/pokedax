/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pokemontcg.io' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static export for all pages
  output: undefined,
}

module.exports = nextConfig