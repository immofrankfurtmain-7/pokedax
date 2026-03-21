import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://pokedax.de'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/preischeck', '/scanner', '/forum'],
        disallow: ['/dashboard', '/api', '/auth/callback'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
