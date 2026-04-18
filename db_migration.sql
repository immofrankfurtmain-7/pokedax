-- Run this in Supabase SQL Editor to add missing columns:
ALTER TABLE sets ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE sets ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE sets ADD COLUMN IF NOT EXISTS symbol_url TEXT;
ALTER TABLE sets ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Also ensure price_history table exists:
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT REFERENCES cards(id),
  date DATE NOT NULL,
  price DECIMAL(10,2),
  price_low DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  source TEXT DEFAULT 'cardmarket',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, date)
);
CREATE INDEX IF NOT EXISTS idx_price_history_card_date ON price_history(card_id, date);

-- Update sets with TCGdex logo URLs (run after alter):
UPDATE sets SET logo_url = 'https://assets.tcgdex.net/en/' || id || '/logo.png' WHERE logo_url IS NULL;
