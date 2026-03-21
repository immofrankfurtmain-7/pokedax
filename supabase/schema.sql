-- ============================================================
-- PokeDax – Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT        UNIQUE NOT NULL,
  email             TEXT        NOT NULL,
  avatar_url        TEXT,
  is_premium        BOOLEAN     DEFAULT FALSE,
  premium_until     TIMESTAMPTZ,
  stripe_customer_id TEXT       UNIQUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── CARD PRICES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.card_prices (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id     TEXT        NOT NULL,
  card_name   TEXT        NOT NULL,
  price       DECIMAL     NOT NULL,
  low         DECIMAL,
  high        DECIMAL,
  avg7        DECIMAL,
  avg30       DECIMAL,
  trend       DECIMAL,
  change7d    DECIMAL,
  signal      TEXT        CHECK (signal IN ('buy','sell','hold')),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_card_prices_card_id ON public.card_prices(card_id);

-- ── PORTFOLIO ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_cards (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id         TEXT        NOT NULL,
  card_name       TEXT        NOT NULL,
  card_img        TEXT,
  set_name        TEXT,
  condition       TEXT        NOT NULL DEFAULT 'NearMint',
  quantity        INTEGER     NOT NULL DEFAULT 1,
  purchase_price  DECIMAL,
  purchase_date   DATE,
  notes           TEXT,
  for_sale        BOOLEAN     DEFAULT FALSE,
  ask_price       DECIMAL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON public.portfolio_cards(user_id);

-- ── MARKETPLACE LISTINGS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.listings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id     TEXT        NOT NULL,
  card_name   TEXT        NOT NULL,
  card_img    TEXT,
  set_name    TEXT,
  condition   TEXT        NOT NULL,
  ask_price   DECIMAL     NOT NULL,
  description TEXT,
  status      TEXT        DEFAULT 'active' CHECK (status IN ('active','sold','removed')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listings_seller   ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status   ON public.listings(status);

-- ── OFFERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_price DECIMAL     NOT NULL,
  message     TEXT,
  status      TEXT        DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── CHAT MESSAGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  read        BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_listing ON public.chat_messages(listing_id);

-- ── FORUM ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.forum_categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  emoji       TEXT,
  color       TEXT,
  gradient    TEXT,
  is_premium  BOOLEAN     DEFAULT FALSE,
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID        NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL,
  tags        TEXT[],
  upvotes     INTEGER     DEFAULT 0,
  reply_count INTEGER     DEFAULT 0,
  is_pinned   BOOLEAN     DEFAULT FALSE,
  is_hot      BOOLEAN     DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_forum_posts_cat    ON public.forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON public.forum_posts(author_id);

CREATE TABLE IF NOT EXISTS public.forum_replies (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  upvotes     INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PRICE ALERTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  card_id       TEXT        NOT NULL,
  card_name     TEXT        NOT NULL,
  card_img      TEXT,
  target_price  DECIMAL     NOT NULL,
  condition     TEXT        NOT NULL CHECK (condition IN ('above','below')),
  is_active     BOOLEAN     DEFAULT TRUE,
  triggered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.price_alerts(user_id);

-- ── SCAN HISTORY ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scan_history (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  card_id     TEXT,
  card_name   TEXT,
  confidence  INTEGER,
  condition   TEXT,
  price       DECIMAL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_prices     ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own, public read
CREATE POLICY "profiles_public_read"  ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_own_update"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Portfolio: own only
CREATE POLICY "portfolio_own"         ON public.portfolio_cards FOR ALL USING (auth.uid() = user_id);

-- Listings: anyone can read active, sellers manage their own
CREATE POLICY "listings_public_read"  ON public.listings FOR SELECT USING (status = 'active');
CREATE POLICY "listings_own_manage"   ON public.listings FOR ALL USING (auth.uid() = seller_id);

-- Offers: buyer or seller can see
CREATE POLICY "offers_participants"   ON public.offers FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT seller_id FROM public.listings WHERE id = listing_id));
CREATE POLICY "offers_buyer_insert"   ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "offers_own_update"     ON public.offers FOR UPDATE USING (auth.uid() = buyer_id);

-- Chat: participants only
CREATE POLICY "chat_participants"     ON public.chat_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "chat_insert"           ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Alerts: own only
CREATE POLICY "alerts_own"            ON public.price_alerts FOR ALL USING (auth.uid() = user_id);

-- Scan history: own only
CREATE POLICY "scans_own"             ON public.scan_history FOR ALL USING (auth.uid() = user_id);

-- Forum posts: anyone reads, authenticated writes
CREATE POLICY "forum_posts_read"      ON public.forum_posts FOR SELECT USING (TRUE);
CREATE POLICY "forum_posts_write"     ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "forum_replies_read"    ON public.forum_replies FOR SELECT USING (TRUE);
CREATE POLICY "forum_replies_write"   ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Card prices: public read
CREATE POLICY "card_prices_read"      ON public.card_prices FOR SELECT USING (TRUE);

-- ── REALTIME ──────────────────────────────────────────────────
-- Enable realtime for price alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_prices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;

-- ── SEED FORUM CATEGORIES ─────────────────────────────────────
INSERT INTO public.forum_categories (name, description, emoji, color, is_premium, sort_order) VALUES
  ('Marktplatz',      'Kaufe und verkaufe Pokémon-Karten',              '🏪', '#ff5500', FALSE, 1),
  ('Preisdiskussion', 'Diskutiere Preisentwicklungen und Trends',        '📈', '#FFD700', FALSE, 2),
  ('Fake-Check',      'Lass deine Karten auf Echtheit prüfen',           '🔍', '#cc44ff', FALSE, 3),
  ('Neuigkeiten',     'Aktuelle News aus der Pokémon TCG Welt',          '📰', '#00aaff', FALSE, 4),
  ('Einsteiger',      'Fragen und Hilfe für neue Sammler',               '🌱', '#00cc66', FALSE, 5),
  ('Turniere',        'Turnierberichte und Event-Ankündigungen',         '🏆', '#ff9900', FALSE, 6),
  ('Premium Lounge',  'Exklusiver Bereich für Premium-Mitglieder',       '⭐', '#FFD700', TRUE,  7)
ON CONFLICT (name) DO NOTHING;
