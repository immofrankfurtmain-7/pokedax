import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title:       { default: 'PokeDax – Deutschlands #1 Pokémon TCG Plattform', template: '%s | PokeDax' },
  description: 'Live-Preise, KI-Scanner, Portfolio-Tracker und Community für Pokémon-Karten-Sammler in Deutschland.',
  keywords:    ['Pokémon', 'TCG', 'Karten', 'Preis', 'Cardmarket', 'Scanner', 'Portfolio'],
  authors:     [{ name: 'PokeDax Team' }],
  creator:     'PokeDax',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pokedax.de'),
  openGraph: {
    type:        'website',
    locale:      'de_DE',
    url:         'https://pokedax.de',
    title:       'PokeDax – Pokémon TCG Preis-Plattform DE',
    description: 'Live-Preise, KI-Scanner und Community für deutsche Pokémon-Sammler.',
    siteName:    'PokeDax',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'PokeDax',
    description: 'Deutschlands #1 Pokémon TCG Preis-Plattform',
  },
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  themeColor: '#04020e',
  width:      'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="bg-noise antialiased">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#150f35',
              border:     '1px solid rgba(124,58,237,0.3)',
              color:      '#e8e8f0',
            },
          }}
        />
      </body>
    </html>
  )
}
