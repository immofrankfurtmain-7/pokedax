-- ============================================================
-- pokédax DB v2.0 — Erweiterte Karten-Datenbank
-- Ausführen in: Supabase → SQL Editor
-- ============================================================

-- 1. pgvector aktivieren
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. cards Tabelle erweitern
ALTER TABLE cards
  -- Mehrsprachigkeit
  ADD COLUMN IF NOT EXISTS name_ja              TEXT,
  ADD COLUMN IF NOT EXISTS name_en              TEXT,
  ADD COLUMN IF NOT EXISTS flavor_text_en       TEXT,
  ADD COLUMN IF NOT EXISTS flavor_text_de       TEXT,
  ADD COLUMN IF NOT EXISTS flavor_text_ja       TEXT,

  -- Bilder
  ADD COLUMN IF NOT EXISTS image_url_hd         TEXT,
  ADD COLUMN IF NOT EXISTS reference_image_url  TEXT,

  -- Hashes für non-AI Scanner
  ADD COLUMN IF NOT EXISTS phash                TEXT,
  ADD COLUMN IF NOT EXISTS dhash                TEXT,
  ADD COLUMN IF NOT EXISTS ahash                TEXT,

  -- Vektor für ANN-Matching (512 dim = Supabase Hobby kompatibel)
  ADD COLUMN IF NOT EXISTS embedding            vector(512),

  -- Qualität & Selbstverbesserung
  ADD COLUMN IF NOT EXISTS data_quality_score   INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS scan_count           INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trade_count          INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_verified_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_scanned_at      TIMESTAMPTZ,

  -- Varianten
  ADD COLUMN IF NOT EXISTS variant_of           TEXT REFERENCES cards(id),
  ADD COLUMN IF NOT EXISTS variant_type         TEXT,
  -- variant_type Werte:
  -- 'reverse_holo' | 'full_art' | 'secret_rare' | 'promo'
  -- 'jp_exclusive' | 'staff' | 'error_card' | 'first_edition'
  -- 'shadowless' | 'graded' | 'cosmos_holo' | 'galaxy_holo'

  -- Erweiterte Kampfdaten (von pokemontcg.io)
  ADD COLUMN IF NOT EXISTS attacks              JSONB,
  ADD COLUMN IF NOT EXISTS abilities            JSONB,
  ADD COLUMN IF NOT EXISTS weaknesses          JSONB,
  ADD COLUMN IF NOT EXISTS resistances         JSONB,
  ADD COLUMN IF NOT EXISTS retreat_cost        INTEGER,
  ADD COLUMN IF NOT EXISTS legalities          JSONB,

  -- Japanische Metadaten
  ADD COLUMN IF NOT EXISTS set_id_jp           TEXT,
  ADD COLUMN IF NOT EXISTS number_jp           TEXT,

  -- Mehrere Preisquellen
  ADD COLUMN IF NOT EXISTS price_tcgplayer     NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS price_grade_psa9    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS price_grade_psa10   NUMERIC(10,2),

  -- Datenquelle
  ADD COLUMN IF NOT EXISTS source              TEXT DEFAULT 'tcgdex',
  ADD COLUMN IF NOT EXISTS source_id_ptcgio    TEXT; -- pokemontcg.io ID

-- 3. sets Tabelle erweitern
ALTER TABLE sets
  ADD COLUMN IF NOT EXISTS name_ja             TEXT,
  ADD COLUMN IF NOT EXISTS name_en             TEXT,
  ADD COLUMN IF NOT EXISTS set_code_ptcgio     TEXT,
  ADD COLUMN IF NOT EXISTS is_jp_exclusive     BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_promo            BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS card_count_secret   INTEGER,
  ADD COLUMN IF NOT EXISTS legality            TEXT;

-- 4. Neue Tabelle: scan_feedback (Self-Improving)
CREATE TABLE IF NOT EXISTS card_scan_feedback (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_id        TEXT REFERENCES cards(id) ON DELETE SET NULL,
  phash_computed TEXT,
  confidence     NUMERIC(5,2),
  was_correct    BOOLEAN,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE card_scan_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_own" ON card_scan_feedback
  FOR ALL USING (auth.uid() = user_id);

-- 5. Neue Tabelle: data_guardian_log
CREATE TABLE IF NOT EXISTS data_guardian_log (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at           TIMESTAMPTZ DEFAULT NOW(),
  hashes_computed  INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  quality_updates  INTEGER DEFAULT 0,
  prices_updated   INTEGER DEFAULT 0,
  report           JSONB
);

-- 6. Neue Tabelle: external_price_feeds
CREATE TABLE IF NOT EXISTS external_price_feeds (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id     TEXT REFERENCES cards(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  price       NUMERIC(10,2),
  currency    TEXT DEFAULT 'EUR',
  condition   TEXT DEFAULT 'NM',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cards_phash
  ON cards(phash) WHERE phash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_quality
  ON cards(data_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_cards_scan_count
  ON cards(scan_count DESC);
CREATE INDEX IF NOT EXISTS idx_cards_variant
  ON cards(variant_of) WHERE variant_of IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_source_id
  ON cards(source_id_ptcgio) WHERE source_id_ptcgio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_price_feeds_card
  ON external_price_feeds(card_id, source, recorded_at DESC);

-- pgvector Index (erst nach Bootstrap mit Daten sinnvoll)
-- CREATE INDEX idx_cards_embedding ON cards
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
--   WHERE embedding IS NOT NULL;

-- 8. SQL-Funktion: Hamming-Distance für pHash-Matching
CREATE OR REPLACE FUNCTION hamming_distance(h1 TEXT, h2 TEXT)
RETURNS INTEGER AS $$
DECLARE dist INTEGER := 0; i INTEGER;
BEGIN
  IF h1 IS NULL OR h2 IS NULL OR length(h1) != length(h2) THEN RETURN 999; END IF;
  FOR i IN 1..length(h1) LOOP
    IF substring(h1,i,1) != substring(h2,i,1) THEN dist := dist + 1; END IF;
  END LOOP;
  RETURN dist;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. SQL-Funktion: Karte per Hash suchen (Kern des non-AI Scanners)
CREATE OR REPLACE FUNCTION find_card_by_hash(
  query_hash   TEXT,
  max_distance INTEGER DEFAULT 10,
  result_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  card_id       TEXT,
  card_name     TEXT,
  card_name_de  TEXT,
  set_id        TEXT,
  phash         TEXT,
  distance      INTEGER,
  confidence    NUMERIC,
  price_market  NUMERIC,
  image_url     TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.name_de, c.set_id, c.phash,
    hamming_distance(c.phash, query_hash) AS distance,
    ROUND((1.0 - hamming_distance(c.phash, query_hash)::numeric/64)*100, 1) AS confidence,
    c.price_market, c.image_url
  FROM cards c
  WHERE c.phash IS NOT NULL
    AND hamming_distance(c.phash, query_hash) <= max_distance
  ORDER BY distance ASC, c.data_quality_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger: scan_count erhöhen
CREATE OR REPLACE FUNCTION fn_update_scan_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cards SET
    scan_count = scan_count + 1,
    last_scanned_at = NOW(),
    data_quality_score = LEAST(100, data_quality_score + 1)
  WHERE id = NEW.card_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_scan_stats ON scan_logs;
CREATE TRIGGER tr_scan_stats
  AFTER INSERT ON scan_logs
  FOR EACH ROW EXECUTE FUNCTION fn_update_scan_stats();

-- 11. Trigger: trade_count erhöhen
CREATE OR REPLACE FUNCTION fn_update_trade_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'released' AND OLD.status != 'released' THEN
    UPDATE cards c SET trade_count = trade_count + 2
    FROM marketplace_listings ml
    WHERE ml.id = (
      SELECT listing_id FROM escrow_transactions
      WHERE id = NEW.id LIMIT 1
    ) AND c.id = ml.card_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_trade_stats ON escrow_transactions;
CREATE TRIGGER tr_trade_stats
  AFTER UPDATE OF status ON escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION fn_update_trade_stats();

SELECT 'DB v2.0 Migration complete ✓ Cards: ' || COUNT(*) FROM cards;
