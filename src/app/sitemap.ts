import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://pokedax.de'
  const now  = new Date()

  return [
    { url: base,                         lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/preischeck`,         lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/scanner`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/forum`,              lastModified: now, changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${base}/auth/login`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/register`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]
}
