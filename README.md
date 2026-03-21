# PokeDax – Setup & Deployment Guide

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Auth, PostgreSQL, Realtime)
- **Stripe** (Premium-Abos)
- **Framer Motion** (Animationen)
- **Pokémon TCG API** (Karten + Bilder)
- **Vercel** (Deployment)

---

## 1. Lokales Setup

```bash
# Repo klonen / Ordner öffnen
cd pokedax

# Dependencies installieren
npm install

# Env-Datei anlegen
cp .env.local.example .env.local
# → Dann .env.local mit deinen Keys befüllen
```

---

## 2. Supabase einrichten

1. Gehe zu [supabase.com](https://supabase.com) → Neues Projekt erstellen
2. **SQL Editor** → Inhalt von `supabase/schema.sql` einfügen → Run
3. **Authentication** → Providers → Google aktivieren (optional)
4. **Project Settings** → API → URL + anon key in `.env.local` eintragen

---

## 3. Stripe einrichten

1. [stripe.com](https://stripe.com) → Dashboard → Produkte
2. Neues Produkt: **PokeDax Premium**
   - Preis 1: 4,99 €/Monat → Price ID in `.env.local`
   - Preis 2: 3,99 €/Monat jährlich → Price ID in `.env.local`
3. **Webhooks** → Endpoint: `https://deine-domain.de/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Secret Key + Webhook Secret in `.env.local`

---

## 4. Pokémon TCG API

- Kostenlos registrieren: [pokemontcg.io](https://pokemontcg.io)
- API Key ist optional (erhöht Rate Limits von 1000 auf 20.000/Tag)
- In `.env.local` eintragen

---

## 5. Lokale Entwicklung

```bash
npm run dev
# → http://localhost:3000
```

Stripe Webhook lokal testen:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 6. Vercel Deployment

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Environment Variables in Vercel Dashboard eintragen:
# Settings → Environment Variables → alle aus .env.local
```

Oder: GitHub Repo → Vercel Dashboard → Import → Auto-Deploy bei jedem Push.

---

## 7. Domain verbinden

1. Vercel Dashboard → Dein Projekt → Settings → Domains
2. `pokedax.de` oder `pokeprice.de` eintragen
3. DNS beim Registrar (z.B. INWX) auf Vercel zeigen lassen

---

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx           # Root Layout + Metadata
│   ├── page.tsx             # Homepage
│   ├── scanner/page.tsx     # KI-Scanner
│   ├── preischeck/page.tsx  # Preischeck
│   ├── forum/page.tsx       # Forum
│   ├── auth/
│   │   ├── login/           # Login
│   │   └── register/        # Registrierung
│   ├── dashboard/
│   │   ├── layout.tsx       # Sidebar-Layout
│   │   ├── page.tsx         # Übersicht
│   │   ├── portfolio/       # Portfolio + Charts
│   │   ├── sets/            # Set-Tracker
│   │   ├── marketplace/     # Interner Marktplatz
│   │   ├── alerts/          # Preis-Alerts (Realtime)
│   │   └── premium/         # Stripe Checkout
│   └── api/
│       ├── auth/callback/   # Supabase OAuth Callback
│       ├── auth/signout/    # Logout
│       ├── stripe/checkout/ # Stripe Checkout Session
│       └── webhooks/stripe/ # Stripe Webhook Handler
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx       # Navigation (sticky, glass)
│   │   ├── Hero.tsx         # Hero Section
│   │   └── Footer.tsx       # Footer
│   ├── mewtwo/
│   │   └── MewtwoCanvas.tsx # Mewtwo Sternenkonstellation
│   ├── cards/
│   │   ├── TcgCard.tsx      # Pokémon-Karten-Komponente
│   │   └── TrendingGrid.tsx # Trending-Grid + Detail-Panel
│   ├── forum/
│   │   └── ForumSection.tsx # Forum-Kategorien als TCG-Karten
│   └── premium/
│       └── PremiumSection.tsx # Pricing-Section
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Client
│   │   ├── server.ts        # Server Client
│   │   └── middleware.ts    # Auth Middleware
│   ├── pokemon-api.ts       # Pokémon TCG API
│   ├── stripe.ts            # Stripe Utility
│   └── utils.ts             # Hilfsfunktionen
├── types/index.ts           # Alle TypeScript Types
└── styles/globals.css       # Global Styles + CSS Variables

supabase/
└── schema.sql               # Komplettes DB-Schema + RLS
```

---

## Nächste Schritte

- [ ] Cardmarket API integrieren (echte Live-Preise)
- [ ] Gemini Vision für echten KI-Scanner
- [ ] Forum vollständig mit Supabase verbinden
- [ ] Portfolio → echte Supabase-Daten
- [ ] Preis-Alerts → E-Mail via Resend/Supabase Edge Functions
- [ ] PWA (Offline-Fähigkeit + App-Icon)
- [ ] Google OAuth in Supabase aktivieren
```
